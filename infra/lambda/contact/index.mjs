import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

// SES identities are regional; wingtheidea.com is verified in SES_REGION, which
// is not necessarily the region this function runs in.
const ses = new SESv2Client({ region: process.env.SES_REGION });

const FROM = process.env.FROM_ADDRESS;
const TO = process.env.TO_ADDRESS;

const LIMITS = { name: 200, email: 320, phone: 50, description: 5000 };
const MIN_DESCRIPTION = 10;
// Deliberately permissive: the only real proof an address works is delivery.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  const method =
    event?.requestContext?.http?.method ?? event?.httpMethod ?? "GET";
  if (method !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  let data;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64").toString("utf8")
      : (event.body ?? "");
    data = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "Malformed request" });
  }

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const description = String(data.description ?? "").trim();
  // Honeypot: a real person never fills a field they cannot see. Report success
  // so bots get no signal about why nothing happened.
  const trap = String(data.company ?? "").trim();
  if (trap) return json(200, { ok: true });

  const errors = [];
  if (!name) errors.push("Name is required");
  else if (name.length > LIMITS.name) errors.push("Name is too long");

  if (!email) errors.push("Email is required");
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email))
    errors.push("Email address looks invalid");

  if (phone && phone.length > LIMITS.phone) errors.push("Contact number is too long");

  if (!description) errors.push("Please describe your idea");
  else if (description.length < MIN_DESCRIPTION)
    errors.push("Please give us a little more detail");
  else if (description.length > LIMITS.description)
    errors.push("Description is too long");

  if (errors.length) return json(400, { ok: false, error: errors[0], errors });

  const ip = event?.requestContext?.http?.sourceIp ?? "unknown";
  const when = new Date().toISOString();

  // Plain text only: nothing the submitter typed is interpreted as markup.
  const text = [
    "New idea submitted via wingtheidea.com",
    "",
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone || "(not given)"}`,
    `Received: ${when}`,
    `Source IP:${ip}`,
    "",
    "Idea",
    "----",
    description,
  ].join("\n");

  try {
    const out = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM,
        Destination: { ToAddresses: [TO] },
        // Replying goes to the person who submitted, not to no-reply.
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: `New idea from ${name}`, Charset: "UTF-8" },
            Body: { Text: { Data: text, Charset: "UTF-8" } },
          },
        },
      }),
    );
    // Log the MessageId: without it there is no way to trace a message that
    // SES accepted but the recipient never saw.
    console.log(
      JSON.stringify({ event: "ses_send_ok", messageId: out.MessageId, to: TO, from: FROM }),
    );
  } catch (err) {
    // Log the detail, return something generic.
    console.error("SES send failed", err);
    return json(502, { ok: false, error: "Could not send your message. Please try again." });
  }

  return json(200, { ok: true });
};
