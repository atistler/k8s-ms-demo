import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";
import {addNamespace} from "./utils";

export class Harbor extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'harbor', {}, opts);
        const namespaceName = namespace.metadata.name;
        new k8s.helm.v2.Chart("harbor", {
            chart: "harbor",
            values,
            fetchOpts: {
                repo: 'https://helm.goharbor.io/'
            },
            namespace: namespaceName,
            transformations: [addNamespace(namespaceName)]
        });
    }
}
