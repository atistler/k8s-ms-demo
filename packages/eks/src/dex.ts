import * as _ from "lodash";
import * as base from '@k8s-ms-modules-demo/common';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';
import {ComponentResourceOptions} from "@pulumi/pulumi";

class DexChart extends base.DexChart {
    configNamespace(): string {
        return 'ManagedServices/Dex/Chart'
    }

    defaults(): object {
        return _.merge(super.defaults(), {});
    }
}

export class Dex extends base.Dex {
    readonly chartAdapter: DexChart;

    constructor(cluster: eks.Cluster, namespace: k8s.core.v1.Namespace, chartOptions: base.ChartOptions, opts?: ComponentResourceOptions) {
        super(cluster.provider, namespace, chartOptions, opts);
        this.chartAdapter = new DexChart('dex', cluster.provider, namespace, chartOptions);
    }
}
