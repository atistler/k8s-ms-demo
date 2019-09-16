import {Output} from "@pulumi/pulumi";

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
