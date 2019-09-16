import * as pulumi from "@pulumi/pulumi";
import axios from "axios";

interface PostData {
    name: string;
}

const httpProvider: pulumi.dynamic.ResourceProvider = {
    async create(inputs: PostData) {
        const response = await axios.post('https://hookb.in/JKqYKb87DbfzQzWp8NJo', {action: 'create', name: inputs.name});
        return {id: 'JKqYKb87DbfzQzWp8NJo', outs: response.data};
    },
    async update(id) {
        const response = await axios.post('https://hookb.in/JKqYKb87DbfzQzWp8NJo', {action: 'update', id});
        return {outs: response.data};
    },
    async delete(id) {
        const response = await axios.post('https://hookb.in/JKqYKb87DbfzQzWp8NJo', {action: 'delete', id});
    }
}

export class HttpPost extends pulumi.dynamic.Resource {
    constructor(name: string, args: PostData, opts?: pulumi.CustomResourceOptions) {
        super(httpProvider, name, args, opts);
    }
}
