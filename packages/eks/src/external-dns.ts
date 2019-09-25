import * as _ from 'lodash';
import * as base from '@k8s-ms-modules-demo/common';
import * as eks from '@pulumi/eks';
import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import {ComponentResourceOptions} from "@pulumi/pulumi";

class ExternalDnsChart extends base.ExternalDnsChart {
    configNamespace(): string {
        return 'ManagedServices/ExternalDns/Chart'
    }
    defaults(): object {
        return _.merge(super.defaults(), {
            provider: 'aws',
            podAnnotations: {
                'iam.amazonaws.com/role': `${this.config().require('clusterName')}-externaldns`
            }
        });
    }
}

export class ExternalDns extends base.ExternalDns {
    constructor(provider: k8s.Provider, namespace: k8s.core.v1.Namespace, chartOptions: base.ChartOptions, opts?: ComponentResourceOptions) {
        super(provider, namespace, chartOptions, opts);

        this.chartAdapter = new ExternalDnsChart('external-dns', provider, namespace, chartOptions);

        const assumeRolePolicy: aws.iam.PolicyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "sts:AssumeRole",
                    Principal: {
                        Service: "ec2.amazonaws.com"
                    },
                    Effect: "Allow",
                    Sid: "",
                },
            ],
        };

        const iamRole = new aws.iam.Role('external-dns', {
            assumeRolePolicy,
            namePrefix: `${this.chartAdapter.config().require('clusterName')}-externaldns`
        })

        this.registerOutputs({
            chart: {
                values: this.chartAdapter.values()
            }
        });
    }
}
