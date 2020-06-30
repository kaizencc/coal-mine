import * as cdk from '@aws-cdk/core';
import { Canary, Code } from '@aws-cdk/aws-synthetics';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';

export class CanaryL2Stack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const canary = new Canary(this, 'my_test', {
          handler: 'index.handler',
          code: Code.fromInline(`var synthetics = require('Synthetics');
          const log = require('SyntheticsLogger');
          const https = require('https');
          const http = require('http');
          
          const apiCanaryBlueprint = async function () {
              const postData = "";
          
              const verifyRequest = async function (requestOption) {
                return new Promise((resolve, reject) => {
                  log.info("Making request with options: " + JSON.stringify(requestOption));
                  let req
                  if (requestOption.port === 443) {
                    req = https.request(requestOption);
                  } else {
                    req = http.request(requestOption);
                  }
                  req.on('response', (res) => {
                    log.info(\`Status Code: \${res.statusCode}\`)
                    log.info(\`Response Headers: \${JSON.stringify(res.headers)}\`)
                    if (res.statusCode !== 200) {
                       reject("Failed: " + requestOption.path);
                    }
                    res.on('data', (d) => {
                      log.info("Response: " + d);
                    });
                    res.on('end', () => {
                      resolve();
                    })
                  });
          
                  req.on('error', (error) => {
                    reject(error);
                  });
          
                  if (postData) {
                    req.write(postData);
                  }
                  req.end();
                });
              }
          
              const headers = {}
              headers['User-Agent'] = [synthetics.getCanaryUserAgentString(), headers['User-Agent']].join(' ');
              const requestOptions = {"hostname":"ajt66lp5wj.execute-api.us-east-1.amazonaws.com","method":"GET","path":"/prod/","port":443}
              requestOptions['headers'] = headers;
              await verifyRequest(requestOptions);
          };
          
          exports.handler = async () => {
              return await apiCanaryBlueprint();
          };`)
      });

        const canaryMetric = canary.metricSuccess();

        canary.createAlarm('CanaryAlarm2',{
          metric: canaryMetric,
          evaluationPeriods: 2,
          threshold: 99,
          comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        });

        //console.log(canary.canaryState);
    }
}