## K8S Pulumi Managed Service Components

This is a monorepo that automatically publishes npm packages that contain Pulumi components.
Each Pulumi component contains the resources necessary for an individual managed service.  Managed services
usually contain a Helm chart and sometimes will contain other cloud native resources.

### References

* Pulumi
    * [Helm Charts](https://www.pulumi.com/docs/tutorials/kubernetes/wordpress-chart/)
    * [EKS](https://www.pulumi.com/docs/tutorials/kubernetes/eks/)
    * [Components](https://www.pulumi.com/docs/tutorials/aws/s3-folder-component/)
* [Lerna](https://github.com/lerna/lerna/blob/master/README.md)
    * `lerna add` Adds npm dependency to all or specific package within a project
    * `lerna bootstrap` Install all dependency from all packages within a project
    * [Common Lerna Commands](https://medium.com/@jsilvax/a-workflow-guide-for-lerna-with-yarn-workspaces-60f97481149d)
* [Yarn](https://yarnpkg.com/en/docs/usage)
    * [Monorepo](https://medium.com/mitterio/multirepo-to-lerna-js-monorepo-80f6657cb443)
