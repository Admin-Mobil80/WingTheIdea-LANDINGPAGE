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

    // This bucket hosts every web app on this domain, one folder per app, but
    // only this stack can manage its policy — a bucket has exactly one, so a
    // second stack declaring one would overwrite this. withOriginAccessControl
    // below grants read to THIS distribution alone (AWS:SourceArn), which
    // leaves a sibling app's distribution with a 403.
    //
    // So read access is also granted at the account level: any CloudFront
    // distribution in this account may read this bucket. That is what lets
    // ReconFlow serve reconflow.wingtheidea.com from RECONFLOW/PORTAL and
    // bms.reconflow.wingtheidea.com from RECONFLOW/BMS, and it means a new app
    // needs no further change here. The bucket stays private: public access is
    // blocked, and only the CloudFront service principal is allowed.
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "AllowCloudFrontOriginAccessControlReadForAccount",
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        conditions: { StringEquals: { "AWS:SourceAccount": this.account } },
      }),
    );

    // Two jobs, both at viewer-request:
    //  1. Redirect the apex to www, so there is one canonical hostname.
    //  2. Rewrite directory paths. Next.js static export emits
    //     /about/index.html, but S3 has no concept of a directory index.
    const rewriteFn = new cloudfront.Function(this, "DirectoryIndexRewrite", {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  if (host === '${config.apexDomain}') {
    var qs = request.querystring ? Object.keys(request.querystring).map(function (k) {
      var v = request.querystring[k].value;
      return v ? k + '=' + v : k;
    }).join('&') : '';
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://${config.siteDomain}' + request.uri + (qs ? '?' + qs : '') },
        'cache-control': { value: 'max-age=3600' },
      },
    };
  }

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
      // Both hostnames terminate here; the viewer-request function 301s the
      // apex to www. The certificate already covers both.
      domainNames: [config.siteDomain, config.apexDomain],
      certificate: props.certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        // OriginPath scopes this distribution to one app's folder, so the
        // bucket can host other apps for this domain alongside it.
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, {
          originPath: `/${config.appFolder}`,
        }),
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

    // Apex records, so wingtheidea.com resolves at all and can be redirected.
    new route53.ARecord(this, "ApexAliasA", {
      zone,
      recordName: config.apexDomain,
      target,
    });
    new route53.AaaaRecord(this, "ApexAliasAAAA", {
      zone,
      recordName: config.apexDomain,
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
          //
          // Both subject formats are accepted: this org customizes the claim to
          // embed numeric owner/repo IDs, and the default form is kept so the
          // role keeps working if that setting is ever turned off. Either way
          // the match is pinned to this single repository.
          StringLike: {
            "token.actions.githubusercontent.com:sub": [
              `repo:${config.githubOrg}/${config.githubRepo}:*`,
              `repo:${config.githubOrg}@${config.githubOwnerId}/${config.githubRepo}@${config.githubRepoId}:*`,
            ],
          },
        },
      ),
    });

    // Scoped to this app's folder: other apps will share this bucket, and the
    // landing page's pipeline has no business writing to their prefixes.
    bucket.grantReadWrite(deployRole, `${config.appFolder}/*`);
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
    new cdk.CfnOutput(this, "S3Prefix", {
      value: config.appFolder,
      description: "Folder inside the bucket this app deploys into",
    });
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, "DeployRoleArn", { value: deployRole.roleArn });
    new cdk.CfnOutput(this, "SiteUrl", { value: `https://${config.siteDomain}` });
  }
}
