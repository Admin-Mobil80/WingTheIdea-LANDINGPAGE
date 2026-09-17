import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { config } from "./config";

/**
 * Lives in us-east-1 because CloudFront only accepts certificates from that
 * region, regardless of where the rest of the stack runs.
 */
export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.zoneName,
    });

    // DNS validation writes a CNAME into the zone and waits for it to resolve.
    // The domain's NS records are already delegated here, so this completes in
    // minutes; without that delegation it would hang until timeout.
    this.certificate = new acm.Certificate(this, "SiteCertificate", {
      domainName: config.siteDomain,
      subjectAlternativeNames: [config.apexDomain],
      validation: acm.CertificateValidation.fromDns(zone),
    });

    new cdk.CfnOutput(this, "CertificateArn", {
      value: this.certificate.certificateArn,
    });
  }
}
