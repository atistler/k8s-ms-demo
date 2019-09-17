import * as _ from 'lodash';
import * as utils from '../utils';
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";
import {installCRDs} from "../utils";

const CRDUrls = [
    "https://raw.githubusercontent.com/jetstack/cert-manager/release-0.6/deploy/manifests/00-crds.yaml"
];

const defaults = {
    affinity: {},
    cainjector: {
        enabled: true,
        extraArgs: [],
        global: {
            imagePullSecrets: [],
            isOpenshift: false,
            leaderElection: {
                namespace: ''
            },
            logLevel: 2,
            priorityClassName: '',
            rbac: {
                create: true
            }
        },
        image: {
            pullPolicy: 'IfNotPresent',
            repository: 'quay.io/jetstack/cert-manager-cainjector'
        },
        nodeSelector: {},
        podAnnotations: {},
        replicaCount: 1,
        resources: {},
        strategy: {}
    },
    'cert-manager': {
        affinity: {},
        cainjector: {
            enabled: true,
            extraArgs: [],
            global: {
                imagePullSecrets: [],
                isOpenshift: false,
                leaderElection: {
                    namespace: ''
                },
                logLevel: 2,
                priorityClassName: '',
                rbac: {
                    create: true
                }
            },
            image: {
                pullPolicy: 'IfNotPresent',
                repository: 'quay.io/jetstack/cert-manager-cainjector'
            },
            nodeSelector: {},
            podAnnotations: {},
            replicaCount: 1,
            resources: {},
            strategy: {}
        },
        clusterResourceNamespace: '',
        extraArgs: [],
        extraEnv: [],
        global: {
            imagePullSecrets: [],
            isOpenshift: false,
            leaderElection: {
                namespace: ''
            },
            logLevel: 2,
            priorityClassName: '',
            rbac: {
                create: true
            }
        },
        image: {
            pullPolicy: 'IfNotPresent',
            repository: 'quay.io/jetstack/cert-manager-controller'
        },
        ingressShim: {},
        nodeSelector: {},
        podAnnotations: {},
        podLabels: {},
        prometheus: {
            enabled: true,
            servicemonitor: {
                enabled: false,
                interval: '60s',
                path: '/metrics',
                prometheusInstance: 'default',
                scrapeTimeout: '30s',
                targetPort: 9402
            }
        },
        replicaCount: 1,
        resources: {},
        securityContext: {
            enabled: false,
            fsGroup: 1001,
            runAsUser: 1001
        },
        serviceAccount: {
            create: true,
            name: null
        },
        strategy: {},
        tolerations: [],
        webhook: {
            enabled: true,
            extraArgs: [],
            global: {
                imagePullSecrets: [],
                isOpenshift: false,
                leaderElection: {
                    namespace: ''
                },
                logLevel: 2,
                priorityClassName: '',
                rbac: {
                    create: true
                }
            },
            image: {
                pullPolicy: 'IfNotPresent',
                repository: 'quay.io/jetstack/cert-manager-webhook'
            },
            injectAPIServerCA: true,
            nodeSelector: {},
            podAnnotations: {},
            replicaCount: 1,
            resources: {},
            strategy: {}
        }
    },
    certificates: [
        {
            hostname: '*.mikem.mk8s.net',
            name: 'wildcard'
        }
    ],
    clusterResourceNamespace: '',
    extraArgs: [],
    extraEnv: [],
    global: {
        imagePullSecrets: [],
        isOpenshift: false,
        leaderElection: {
            namespace: ''
        },
        logLevel: 2,
        priorityClassName: '',
        rbac: {
            create: true
        }
    },
    image: {
        pullPolicy: 'IfNotPresent',
        repository: 'quay.io/jetstack/cert-manager-controller',
        tag: 'v0.9.1'
    },
    ingressShim: {},
    issuers: {
        route53: {
            accessKeyID: 'AKIA************NHAM',
            region: 'us-east-2',
            secretAccessKey: 'vGx5**********************IPbt'
        }
    },
    nodeSelector: {},
    podAnnotations: {},
    podLabels: {},
    prometheus: {
        enabled: true,
        servicemonitor: {
            enabled: false,
            interval: '60s',
            path: '/metrics',
            prometheusInstance: 'default',
            scrapeTimeout: '30s',
            targetPort: 9402
        }
    },
    replicaCount: 1,
    resources: {},
    securityContext: {
        enabled: false,
        fsGroup: 1001,
        runAsUser: 1001
    },
    serviceAccount: {
        create: true,
        name: null
    },
    strategy: {},
    tolerations: [],
    useLetsEncryptStaging: false,
    webhook: {
        enabled: true,
        extraArgs: [],
        global: {
            imagePullSecrets: [],
            isOpenshift: false,
            leaderElection: {
                namespace: ''
            },
            logLevel: 2,
            priorityClassName: '',
            rbac: {
                create: true
            }
        },
        image: {
            pullPolicy: 'IfNotPresent',
            repository: 'quay.io/jetstack/cert-manager-webhook'
        },
        injectAPIServerCA: true,
        nodeSelector: {},
        podAnnotations: {},
        replicaCount: 1,
        resources: {},
        strategy: {}
    }
};


export class CertManager extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'cert-manager', {}, opts);
        const namespaceName = namespace.metadata.name;
        installCRDs(CRDUrls, {multiDoc: true}).then(crds => {
            new k8s.helm.v2.Chart("cert-manager", {
                chart: 'cert-manager',
                version: '0.9.1',
                values: _.merge(defaults, values),
                fetchOpts: {
                    repo: 'https://charts.jetstack.io'
                },
                namespace: namespaceName,
                transformations: [utils.addNamespace(namespaceName)]
            }, {dependsOn: crds, providers: {"kubernetes": cluster.provider}});
        })
    }
}
