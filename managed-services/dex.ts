import * as utils from '../utils';
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";

export class Dex extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'dex', {}, opts);
        const namespaceName = namespace.metadata.name;
        new k8s.helm.v2.Chart("dex", {
            chart: "stable/dex",
            values,
            namespace: namespaceName,
            transformations: [utils.addNamespace(namespaceName)]
        }, {dependsOn: namespace, providers: {"kubernetes": cluster.provider}});
    }
}

