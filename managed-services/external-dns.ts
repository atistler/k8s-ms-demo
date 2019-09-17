import * as _ from 'lodash';
import * as utils from '../utils';
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";

const defaults = {
    affinity: {},
    annotationFilter: '',
    aws: {
        assumeRoleArn: null,
        batchChangeSize: 1000,
        credentials: {
            accessKey: 'AKIAYCLR4WGHJY6PNHAM',
            mountPath: '/.aws',
            secretKey: 'vGx**************************Pbt'
        },
        region: 'us-east-2',
        zoneType: ''
    },
    azure: {
        resourceGroup: '',
        secretName: ''
    },
    cloudflare: {
        apiKey: '',
        email: '',
        proxied: true
    },
    crd: {
        apiversion: '',
        create: false,
        kind: ''
    },
    designate: {
        customCA: {
            content: '',
            enabled: false,
            filename: 'designate-ca.pem',
            mountPath: '/config/designate'
        }
    },
    digitalocean: {
        apiToken: ''
    },
    domainFilters: [],
    dryRun: false,
    extraArgs: {},
    google: {
        project: '',
        serviceAccountKey: '',
        serviceAccountSecret: ''
    },
    image: {
        pullPolicy: 'IfNotPresent',
        registry: 'docker.io',
        repository: 'bitnami/external-dns',
        tag: '0.5.15-debian-9-r46'
    },
    infoblox: {
        domainFilter: '',
        gridHost: '',
        noSslVerify: false,
        wapiConnectionPoolSize: '',
        wapiHttpTimeout: '',
        wapiPassword: '',
        wapiPort: '',
        wapiUsername: 'admin',
        wapiVersion: ''
    },
    interval: '1m',
    istioIngressGateways: [],
    livenessProbe: {
        failureThreshold: 2,
        httpGet: {
            path: '/healthz',
            port: 'http'
        },
        initialDelaySeconds: 10,
        periodSeconds: 10,
        successThreshold: 1,
        timeoutSeconds: 5
    },
    logLevel: 'info',
    metrics: {
        enabled: false
    },
    nodeSelector: {},
    pdns: {
        apiKey: '',
        apiPort: '8081',
        apiUrl: ''
    },
    podAnnotations: {},
    podLabels: {},
    podSecurityContext: {
        fsGroup: 1001,
        runAsUser: 1001
    },
    policy: 'upsert-only',
    priorityClassName: '',
    provider: 'aws',
    publishInternalServices: true,
    rbac: {
        apiVersion: 'v1beta1',
        create: true,
        pspEnabled: false,
        serviceAccountName: 'default'
    },
    readinessProbe: {
        failureThreshold: 6,
        httpGet: {
            path: '/healthz',
            port: 'http'
        },
        initialDelaySeconds: 5,
        periodSeconds: 10,
        successThreshold: 1,
        timeoutSeconds: 5
    },
    registry: 'txt',
    replicas: 1,
    resources: {
        limits: {
            cpu: '50m',
            memory: '50Mi'
        },
        resources: {
            cpu: '50m',
            memory: '10Mi'
        }
    },
    rfc2136: {
        host: '',
        port: 53,
        tsigAxfr: true,
        tsigKeyname: 'externaldns-key',
        tsigSecret: '',
        tsigSecretAlg: 'hmac-sha256',
        zone: ''
    },
    securityContext: {},
    service: {
        annotations: {},
        externalIPs: [],
        loadBalancerSourceRanges: [],
        port: 7979,
        type: 'ClusterIP'
    },
    sources: [
        'service',
        'ingress'
    ],
    tolerations: [],
    txtOwnerId: '',
    zoneIdFilters: []
};


export class ExternalDns extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'external-dns', {}, opts);
        const namespaceName = namespace.metadata.name;
        new k8s.helm.v2.Chart("external-dns", {
            chart: "stable/external-dns",
            values: _.merge(defaults, values),
            namespace: namespaceName,
            transformations: [utils.addNamespace(namespaceName)]
        }, {dependsOn: namespace, providers: {"kubernetes": cluster.provider}});
    }
}

