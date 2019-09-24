import * as _ from 'lodash';
import * as utils from '../utils';
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as jsonpatch from "fast-json-patch";

export interface ChartOptions {
    readonly version?: string,
    readonly chart?: string,
    readonly repo?: string,
}

export abstract class ChartAdapter {
    readonly chart: k8s.helm.v2.Chart;

    constructor(releaseName: string, provider: k8s.Provider, namespace: k8s.core.v1.Namespace, chartOptions: ChartOptions) {
        const namespaceName = namespace.metadata.name;
        this.chart = new k8s.helm.v2.Chart(releaseName, {
            chart: chartOptions.chart || this.defaultChart(),
            version: chartOptions.version || this.defaultVersion(),
            values: this.values(),
            namespace: namespaceName,
            transformations: [utils.addNamespace(namespaceName)]
        }, {dependsOn: namespace, providers: {"kubernetes": provider}});
    }

    abstract defaultVersion(): string;

    abstract defaultChart(): string;

    abstract defaults(): object

    abstract configNamespace(): string

    config(): pulumi.Config {
        return new pulumi.Config(this.configNamespace());
    }

    values(): object {
        const overrides = this.config().getObject('overrides');
        const patch = this.config().getObject('patch') as any;
        let values = this.defaults();
        if (overrides) {
            values = _.merge(values, overrides);
        }
        if (patch && patch.ops) {
            values = jsonpatch.applyPatch(values, patch.ops).newDocument;
        }
        return values
    }
}
