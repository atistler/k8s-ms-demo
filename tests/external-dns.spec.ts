import * as aws from "@pulumi/aws";
import {expect} from "chai";
import * as pulumi from "@pulumi/pulumi";
import {promise} from "./index";
import {externalDns} from "../index";

describe("#externalDns", () => {
    it("Should have resources", async () => {
        if (pulumi.runtime.isDryRun()) {
            await pulumi.log.warn("Skipped resource check: not known during preview -- will test after apply");
        } else {
            const resources = await promise(externalDns.chartAdapter.chart.resources);
            if (resources) {
                expect(resources['apps/v1/Deployment::rax-managed/external-dns'].id).to.eq('rax-managed/external-dns');
            }
        }
    });
});
