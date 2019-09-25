import * as _ from 'lodash';
import * as k8s from "@pulumi/kubernetes";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";
import {ChartAdapter, ChartOptions} from "./chart-adapter";

interface Connector {
    readonly type: string
    readonly id: string
    readonly name: string
    readonly ssoURL: string
    readonly redirectURI: string
    readonly usernameAttr: string
    readonly emailAttr: string
    readonly groupsAttr: string
    readonly caData: string
}

interface StaticPassword {
    readonly email: string
    readonly hash: string
}

export interface DexConfig {
    readonly clusterDNSDomain: string

    readonly connectors?: Connector[]
    readonly staticPasswords?: StaticPassword[]
}

export abstract class DexChart extends ChartAdapter {
    defaultVersion(): string {
        return '1.5.1'
    };

    defaultChart(): string {
        return "stable/dex"
    };

    configNamespace(): string {
        return 'ManagedServices:Dex'
    }

    defaults(): object {
        const values = {
            image: 'quay.io/dexidp/dex',
            imageTag: 'v2.17.0',
            config: {
                issuer: `https://dex.${this.config().require('clusterDNSDomain')}`,
                storage: {
                    type: 'kubernetes',
                    config: {
                        inCluster: true
                    }
                },
                enablePasswordDB: false,
                staticPasswords: [],
                connectors: []
            },
            ingress: {
                enabled: true,
                path: '/',
                hosts: [`dex.${this.config().require('clusterDNSDomain')}`],
                annotations: {
                    'nginx.ingress.kubernetes.io/rewrite-target': '/',
                    'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
                    'external-dns.alpha.kubernetes.io/hostname': `dex.${this.config().require('clusterDNSDomain')}`
                },
                tls: {
                    hosts: [`dex.${this.config().require('clusterDNSDomain')}`],
                    secretName: 'cert-wildcard'
                }
            }
        };
        if (_.isEmpty(this.config().getObject('connectors'))) {
            values.config.enablePasswordDB = true;
            // @ts-ignore
            values.config.staticPasswords = this.config().requireObject('staticPasswords');
        } else {
            // @ts-ignore
            values.config.connectors = this.config().requireObject('connectors')
        }
        return values;
    };
}

export class Dex extends ComponentResource {
    constructor(provider: k8s.Provider, namespace: k8s.core.v1.Namespace, chartOptions: ChartOptions, opts?: ComponentResourceOptions) {
        super('managed-services', 'dex', {}, opts);
    }
}


