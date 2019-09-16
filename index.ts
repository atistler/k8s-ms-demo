import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import {Dex, Harbor, PrometheusOperator} from './managed-services';

// Create VPC
const vpc = new awsx.ec2.Vpc("k8s-ms-demo", {
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 2,
    subnets: [{type: "public"}, {type: "private"}]
});

// Create an EKS cluster
const cluster = new eks.Cluster("k8s-ms-demo", {
    vpcId: vpc.id,
    subnetIds: vpc.privateSubnetIds,
    instanceType: "t2.medium",
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    deployDashboard: false
});

const namespace = new k8s.core.v1.Namespace('rax-managed', {
    metadata: {
        name: 'rax-managed'
    }
}, {provider: cluster.provider});

const dex = new Dex(cluster, namespace);
const harbor = new Harbor(cluster, namespace, {
    expose: {
        type: 'ClusterIP',
        tls: {
            commonName: 'harbor.atistler.mk8s.rackspace.net'
        }
    }
});
const prometheusOperator = new PrometheusOperator(cluster, namespace);

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;
