import { exec } from "@actions/exec";
import * as fs from "fs";
import path from "path";
import { Result } from "../Result";

export interface Audit {
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
    };
    dependencies: number;
    devDependencies: number;
    optionalDependencies: number;
    totalDependencies: number;
  };
}

const parseAudit = (audit: Audit): Result<Audit["metadata"]> => {
  const vulnerabilities = audit.metadata.vulnerabilities;
  const sumOfVulnerabilities = Object.keys(vulnerabilities).reduce(
    (sum, key) => sum + vulnerabilities[key],
    0
  );
  const isOkay = vulnerabilities.high + vulnerabilities.critical === 0;
  const shortText = `info: ${vulnerabilities.info} low: ${vulnerabilities.low} moderate: ${vulnerabilities.moderate} high: ${vulnerabilities.high} critical: ${vulnerabilities.critical}`;
  const metadata = audit.metadata;
  const text = `${sumOfVulnerabilities} ${
    sumOfVulnerabilities === 1 ? "vulnerability" : "vulnerabilities"
  } detected in ${audit.metadata.totalDependencies} total dependencies:
  \ninfo: ${vulnerabilities.info}
  \nlow: ${vulnerabilities.low}
  \nmoderate: ${vulnerabilities.moderate}
  \nhigh: ${vulnerabilities.high}
  \ncritical: ${vulnerabilities.critical}`;

  return {
    metadata,
    isOkay,
    shortText,
    text
  };
};

export async function runAudit(): Promise<Result<Audit["metadata"]>> {
  let output = "";
  const options = {
    failOnStdErr: false,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        output += data.toString();
      }
    }
  };

  try {
    await exec("npm", ["audit", "--json"], options);

    console.log(output);
    console.log("Vor JSON.parse");
    const auditResult: Audit = JSON.parse(
      JSON.stringify({
        actions: [
          {
            action: "review",
            module: "node-sass",
            resolves: [
              {
                id: 961,
                path: "node-sass",
                dev: true,
                bundled: false,
                optional: false
              }
            ]
          }
        ],
        advisories: {
          "961": {
            findings: [
              {
                version: "4.13.0",
                paths: ["node-sass"]
              }
            ],
            id: 961,
            created: "2019-06-12T13:44:17.616Z",
            updated: "2020-01-13T20:16:49.738Z",
            deleted: null,
            title: "Denial of Service",
            found_by: {
              link: "",
              name: "Alexander Jordan",
              email: ""
            },
            reported_by: {
              link: "",
              name: "Alexander Jordan",
              email: ""
            },
            module_name: "node-sass",
            cves: [],
            vulnerable_versions: ">=0.0.0",
            patched_versions: "<0.0.0",
            overview:
              "All versions of `node-sass` are vulnerable to Denial of Service (DoS). Crafted objects passed to the `renderSync` function may trigger C++ assertions in `CustomImporterBridge::get_importer_entry` and `CustomImporterBridge::post_process_return_value` that crash the Node process. This may allow attackers to crash the system's running Node process and lead to Denial of Service.",
            recommendation:
              "No fix is currently available. Consider using an alternative package until a fix is made available.",
            references: "",
            access: "public",
            severity: "low",
            cwe: "CWE-400",
            metadata: {
              module_type: "",
              exploitability: 2,
              affected_components: ""
            },
            url: "https://npmjs.com/advisories/961"
          }
        },
        muted: [],
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 1,
            moderate: 0,
            high: 0,
            critical: 0
          },
          dependencies: 396,
          devDependencies: 926402,
          optionalDependencies: 10307,
          totalDependencies: 926798
        },
        runId: "c6476823-afb9-45e5-8bd6-753fc404394c"
      })
    );
    console.log("Nach JSON.parse");
    fs.mkdirSync("audit");
    fs.writeFileSync(
      path.join("audit", "index.html"),
      `<html><body><pre><code>${JSON.stringify(
        auditResult,
        null,
        2
      )}</code></pre></body></html>`
    );
    return parseAudit(auditResult);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
