import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { config } from "./config";

export interface SiteStackProps extends cdk.StackProps {
  readonly certificate: acm.ICertificate;
}

export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.zoneName,
    });

    // Private bucket: all public access blocked. CloudFront reaches it through
    // Origin Access Control, so the bucket is never directly readable.
    const bucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: config.bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      // RETAIN: this account is shared with other products, and an accidental
      // stack delete must not take the site's contents with it.
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Next.js static export emits /about/index.html, but S3 has no concept of
    // a directory index. This rewrites the request path before it reaches the
    // origin.
    const rewriteFn = new cloudfront.Function(this, "DirectoryIndexRewrite", {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
      `),
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      comment: `${config.prefix} landing page`,
      defaultRootObject: "index.html",
      domainNames: [config.siteDomain],
      certificate: props.certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy:
          cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
        functionAssociations: [
          {
            function: rewriteFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    const target = route53.RecordTarget.fromAlias(
      new targets.CloudFrontTarget(distribution),
    );
    new route53.ARecord(this, "SiteAliasA", {
      zone,
      recordName: config.siteDomain,
      target,
    });
    new route53.AaaaRecord(this, "SiteAliasAAAA", {
      zone,
      recordName: config.siteDomain,
      target,
    });

    // --- GitHub Actions deploy role (OIDC, no stored credentials) ----------

    // Imported: IAM permits only one provider per URL per account, and another
    // product created this one on 2026-04-16.
    const provider =
      iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        "GithubOidcProvider",
        config.githubOidcProviderArn,
      );

    const deployRole = new iam.Role(this, "GithubDeployRole", {
      roleName: `${config.prefix}-landingpage-github-deploy`,
      description:
        "Assumed by GitHub Actions to publish the WingTheIdea landing page",
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          // Scoped to this one repo. Without this condition ANY GitHub repo in
          // the world could assume the role.
          StringLike: {
            "token.actions.githubusercontent.com:sub": `repo:${config.githubOrg}/${config.githubRepo}:*`,
          },
        },
      ),
    });

    bucket.grantReadWrite(deployRole);
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        ],
      }),
    );

    // --- Outputs: these feed the GitHub repo variables --------------------

    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, "DeployRoleArn", { value: deployRole.roleArn });
    new cdk.CfnOutput(this, "SiteUrl", { value: `https://${config.siteDomain}` });
  }
}
