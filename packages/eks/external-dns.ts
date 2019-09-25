import * as _ from 'lodash';
import * as base from '../external-dns';
import * as eks from '@pulumi/eks';
import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import {ChartOptions} from "../../lib/chart-adapter";
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
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, chartOptions: ChartOptions, opts?: ComponentResourceOptions) {
        super(cluster.provider, namespace, chartOptions, opts);

        this.chartAdapter = new ExternalDnsChart('external-dns', cluster.provider, namespace, chartOptions);

        const policy: aws.iam.PolicyDocument = {
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
            assumeRolePolicy: policy,
            namePrefix: `${}`

        })

        this.registerOutputs({
            chart: {
                values: this.chartAdapter.values()
            }
        });
    }
}
