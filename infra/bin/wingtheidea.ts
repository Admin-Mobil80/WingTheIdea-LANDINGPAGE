#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificateStack } from "../lib/certificate-stack";
import { EmailStack } from "../lib/email-stack";
import { SiteStack } from "../lib/site-stack";
import { config } from "../lib/config";

const app = new cdk.App();

const certStack = new CertificateStack(app, "WingTheIdeaCertificate", {
  env: { account: config.account, region: config.certRegion },
  description: "ACM certificate for www.wingtheidea.com (CloudFront requires us-east-1)",
  crossRegionReferences: true,
});

const siteStack = new SiteStack(app, "WingTheIdeaSite", {
  env: { account: config.account, region: config.region },
  description: "S3 + CloudFront hosting for the WingTheIdea landing page",
  crossRegionReferences: true,
  certificate: certStack.certificate,
});
siteStack.addStackDependency(certStack);

new EmailStack(app, "WingTheIdeaEmail", {
  env: { account: config.account, region: config.sesRegion },
  description: "SES domain identity for wingtheidea.com",
  crossRegionReferences: true,
});

// Products share this AWS account, so every resource must be identifiable.
cdk.Tags.of(app).add("Project", "WingTheIdea");
cdk.Tags.of(app).add("ManagedBy", "CDK");
cdk.Tags.of(app).add("Repo", `${config.githubOrg}/${config.githubRepo}`);

app.synth();
