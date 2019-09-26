import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import {ChartAdapter, ChartOptions} from "./chart-adapter";

export abstract class ExternalDnsChart extends ChartAdapter {

    defaultVersion(): string {
        return '2.6.1'
    };

    defaultChart(): string {
        return "stable/external-dns"
    };

    defaults(): object {
        return {
            image: {
                registry: 'docker.io',
                repository: 'bitnami/external-dns',
                tag: '0.5.15-debian-9-r46'
            },
            publishInternalServices: true,
            rbac: {
                create: true
            },
            resources: {
                limits: {
                    cpu: this.config().require('externalDNSCPULimit'),
                    memory: this.config().require('externalDNSRAMLimit')
                },
                resources: {
                    cpu: this.config().require('externalDNSCPURequest'),
                    memory: this.config().require('externalDNSRAMRequest')
                }
            }
        };
    }
}

export class ExternalDns extends pulumi.ComponentResource {
    chartAdapter: ExternalDnsChart;

    constructor(provider: k8s.Provider, namespace: k8s.core.v1.Namespace, chartOptions?: ChartOptions, opts?: pulumi.ComponentResourceOptions) {
        super('managed-services', 'external-dns', {}, opts);
    }
}


