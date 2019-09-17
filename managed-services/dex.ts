import * as _ from 'lodash';
import * as utils from '../utils';
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";

const defaults = {
    affinity: {},
    certs: {
        grpc: {
            activeDeadlineSeconds: 300,
            altIPs: {},
            altNames: [
                'dex.io'
            ],
            create: true,
            secret: {
                caName: 'dex-grpc-ca',
                clientTlsName: 'dex-grpc-client-tls',
                serverTlsName: 'dex-grpc-server-tls'
            }
        },
        image: 'gcr.io/google_containers/kubernetes-dashboard-init-amd64',
        imagePullPolicy: 'IfNotPresent',
        imageTag: 'v1.0.0',
        securityContext: {
            enabled: true,
            fsGroup: 65534,
            runAsUser: 65534
        },
        web: {
            activeDeadlineSeconds: 300,
            altIPs: {},
            altNames: [
                'dex.io'
            ],
            caDays: 10000,
            certDays: 10000,
            create: true,
            secret: {
                caName: 'dex-web-server-ca',
                tlsName: 'dex-web-server-tls'
            }
        }
    },
    config: {
        connectors: null,
        enablePasswordDB: true,
        grpc: {
            addr: '0.0.0.0:5000',
            tlsCert: '/etc/dex/tls/grpc/server/tls.crt',
            tlsClientCA: '/etc/dex/tls/grpc/ca/tls.crt',
            tlsKey: '/etc/dex/tls/grpc/server/tls.key'
        },
        issuer: 'https://dex.mikem.mk8s.net',
        logger: {
            level: 'debug'
        },
        oauth2: {
            skipApprovalScreen: true
        },
        staticPasswords: [
            {
                email: 'k1z3m0pl3unnah30prsl',
                hash: '$2a$10$II79UimohdnGBEz2aIZ8deLTOtCNi1T9tsHLGGfXel0PEFEmBZ1yq'
            }
        ],
        storage: {
            config: {
                inCluster: true
            },
            type: 'kubernetes'
        },
        web: {
            http: '0.0.0.0:8080'
        }
    },
    env: [],
    extraVolumeMounts: [],
    extraVolumes: [],
    image: 'quay.io/dexidp/dex',
    imagePullPolicy: 'IfNotPresent',
    imageTag: 'v2.17.0',
    inMiniKube: false,
    ingress: {
        annotations: {
            'external-dns.alpha.kubernetes.io/hostname': 'dex.mikem.mk8s.net',
            'nginx.ingress.kubernetes.io/rewrite-target': '/',
            'nginx.ingress.kubernetes.io/ssl-redirect': 'true'
        },
        enabled: true,
        hosts: [
            'dex.mikem.mk8s.net'
        ],
        path: '/',
        tls: [
            {
                hosts: [
                    'dex.mikem.mk8s.net'
                ],
                secretName: 'cert-wildcard'
            }
        ]
    },
    nodeSelector: {},
    podAnnotations: {},
    podDisruptionBudget: {},
    ports: [
        {
            containerPort: 8080,
            name: 'http',
            protocol: 'TCP'
        },
        {
            containerPort: 5000,
            name: 'grpc',
            protocol: 'TCP'
        }
    ],
    rbac: {
        create: true
    },
    replicas: 1,
    service: {
        annotations: {},
        port: 8080,
        type: 'ClusterIP'
    },
    serviceAccount: {
        create: true,
        name: null
    },
    tolerations: []
};

export class Dex extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'dex', {}, opts);
        const namespaceName = namespace.metadata.name;
        new k8s.helm.v2.Chart("dex", {
            chart: "stable/dex",
            version: "1.5.1",
            values: _.merge(defaults, values),
            namespace: namespaceName,
            transformations: [utils.addNamespace(namespaceName)]
        }, {dependsOn: namespace, providers: {"kubernetes": cluster.provider}});
    }
}

