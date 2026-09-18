import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ses from "aws-cdk-lib/aws-ses";
import { Construct } from "constructs";
import { config } from "./config";

/**
 * SES domain identity for wingtheidea.com, verified by Easy DKIM.
 *
 * SES identities are REGIONAL. This stack deploys to us-east-1, so sending must
 * also happen from us-east-1 — verifying here does not verify the domain in
 * ap-south-1.
 */
export class EmailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.zoneName,
    });

    // Passing the hosted zone makes CDK write the three DKIM CNAME records
    // itself, so verification completes without any manual DNS step.
    //
    // A custom MAIL FROM subdomain makes SPF *align* with wingtheidea.com.
    // Without it the envelope sender is amazonses.com: SPF still passes, but it
    // authenticates Amazon's domain rather than ours, so DMARC leans entirely on
    // DKIM and receivers like Gmail treat the mail as weaker.
    const identity = new ses.EmailIdentity(this, "DomainIdentity", {
      identity: ses.Identity.publicHostedZone(zone),
      mailFromDomain: `mail.${config.zoneName}`,
    });

    // SPF for the domain itself. Missing entirely until now, which is a common
    // reason a new sending domain lands in Gmail's spam folder.
    new route53.TxtRecord(this, "SpfRecord", {
      zone,
      recordName: config.zoneName,
      values: ["v=spf1 include:amazonses.com ~all"],
      ttl: cdk.Duration.hours(1),
    });

    // Start DMARC in monitor-only mode. Tighten to quarantine/reject once you
    // have seen reports and know every legitimate sender is aligned — going
    // straight to reject can silently drop real mail.
    new route53.TxtRecord(this, "DmarcRecord", {
      zone,
      recordName: `_dmarc.${config.zoneName}`,
      values: ["v=DMARC1; p=none;"],
      ttl: cdk.Duration.hours(1),
    });

    new cdk.CfnOutput(this, "SesIdentityName", {
      value: identity.emailIdentityName,
    });
    new cdk.CfnOutput(this, "SesRegion", {
      value: config.sesRegion,
      description: "Domain is verified only in this region",
    });
  }
}
