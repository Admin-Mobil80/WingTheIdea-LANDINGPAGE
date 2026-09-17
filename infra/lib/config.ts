/** Shared configuration for the WingTheIdea umbrella infrastructure. */
export const config = {
  /** Shared account — cloudmeter, expense.ai and flaunt live here too. */
  account: "231427841372",
  /** CloudFront requires its ACM certificate in us-east-1, always. */
  certRegion: "us-east-1",
  /** Everything else follows the group's default region. */
  region: "ap-south-1",

  /** Hosted zone created manually by Riyad; CDK imports it and never owns it. */
  hostedZoneId: "Z008500039SSWYWL7HKJI",
  zoneName: "wingtheidea.com",

  /** The landing page is served here. */
  siteDomain: "www.wingtheidea.com",
  /** Kept on the certificate so an apex -> www redirect can be added later
   *  without reissuing. */
  apexDomain: "wingtheidea.com",

  /**
   * House convention, matching every other product in this account: one
   * webapps.<domain> bucket per domain, holding a folder per app, with a
   * CloudFront distribution per subdomain pointing at its folder via
   * OriginPath (e.g. webapps.skilterco.com/PORTAL -> portal.skilterco.com).
   *
   * Dots in the bucket name are fine here: a dozen live sites in this account
   * already serve from dotted webapps.* buckets over OAC REST origins.
   */
  bucketName: "webapps.wingtheidea.com",
  /** Folder inside the bucket for this app, and the distribution's OriginPath. */
  appFolder: "LANDINGPAGE",

  /** The account already has one GitHub OIDC provider (created 2026-04-16 by
   *  another product). IAM allows only one per URL, so it is imported. */
  githubOidcProviderArn:
    "arn:aws:iam::231427841372:oidc-provider/token.actions.githubusercontent.com",
  githubOrg: "Admin-Mobil80",
  githubRepo: "WingTheIdea-LANDINGPAGE",

  /**
   * This org customizes the OIDC subject claim to embed numeric IDs, so tokens
   * arrive as:
   *   repo:Admin-Mobil80@208915971/WingTheIdea-LANDINGPAGE@1374852340:ref:...
   * rather than the default repo:<org>/<repo>:ref:...
   * The trust policy must match this form or every AssumeRoleWithWebIdentity
   * is denied. IDs are immutable, which is the point of the customization.
   */
  githubOwnerId: "208915971",
  githubRepoId: "1374852340",

  /** SES domain identity region. SES identities are per-region: verifying in
   *  us-east-1 does NOT verify in ap-south-1. Sending must use this region. */
  sesRegion: "us-east-1",

  /** Resource prefix — mandatory, since products share this account. */
  prefix: "wingtheidea",
} as const;
