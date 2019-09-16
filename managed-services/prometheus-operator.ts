import axios from "axios";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import {ComponentResourceOptions, ComponentResource} from "@pulumi/pulumi";
import {addNamespace} from "../utils";

const CRDUrls = [
    "https://raw.githubusercontent.com/coreos/prometheus-operator/master/example/prometheus-operator-crd/alertmanager.crd.yaml",
    "https://raw.githubusercontent.com/coreos/prometheus-operator/master/example/prometheus-operator-crd/prometheus.crd.yaml",
    "https://raw.githubusercontent.com/coreos/prometheus-operator/master/example/prometheus-operator-crd/prometheusrule.crd.yaml",
    "https://raw.githubusercontent.com/coreos/prometheus-operator/master/example/prometheus-operator-crd/servicemonitor.crd.yaml",
    "https://raw.githubusercontent.com/coreos/prometheus-operator/master/example/prometheus-operator-crd/podmonitor.crd.yaml"
];

export class PrometheusOperator extends ComponentResource {
    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, values?: object, opts?: ComponentResourceOptions) {
        super('managed-services', 'prometheus-operator', {}, opts);
        const namespaceName = namespace.metadata.name;
        Promise.all(CRDUrls.map(url => {
            return axios.get(url).then(resp => {
                const content = yaml.safeLoad(resp.data);
                return new k8s.apiextensions.CustomResource(_.last(url.split('/'))!.split('.').join('-'), content);
            });
        })).then((crds) => {
            new k8s.helm.v2.Chart("prometheus-operator", {
                repo: "stable",
                chart: "prometheus-operator",
                values: _.merge({
                    prometheusOperator: {
                        createCustomResource: false
                    }
                }, values),
                namespace: namespaceName,
                transformations: [addNamespace(namespaceName)]
            }, {dependsOn: crds, providers: {"kubernetes": cluster.provider}});
        });
    }
}
