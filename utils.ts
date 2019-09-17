import {Output} from "@pulumi/pulumi";
import axios from "axios";
import * as yaml from "js-yaml";
import * as k8s from "@pulumi/kubernetes";
import * as _ from "lodash";

export const addNamespace = (namespace: string | Output<string>) => {
    return (o: any) => {
        if (o !== undefined) {
            if (o.metadata !== undefined) {
                o.metadata.namespace = namespace;
            } else {
                o.metadata = {namespace: namespace};
            }
        }
    }
};

export const installCRDs = async (urls: string[], options: { multiDoc: boolean } = {multiDoc: false}): Promise<k8s.apiextensions.CustomResource[]> => {
    const responses = await Promise.all(urls.map(url => axios.get(url)));
    const crds: k8s.apiextensions.CustomResource[] = [];
    if (options.multiDoc) {
        responses.forEach(response => {
            yaml.safeLoadAll(response.data, content => {
                if (content) {
                    crds.push(new k8s.apiextensions.CustomResource(content.metadata.name.split('.').join('-'), content));
                }
            });
        });
    } else {
        responses.forEach(response => {
            const content = yaml.safeLoad(response.data);
            crds.push(new k8s.apiextensions.CustomResource(content.metadata.name.split('.').join('-'), content));
        });
    }
    return crds;
}
