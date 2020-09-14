import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as fs from 'fs';
import path from 'path';
import { Result, GitHubContext } from '@tangro/tangro-github-toolkit';
import { generateAuditDetails } from './auditDetails';

export interface Audit {
  actions: Array<any>;
  muted: Array<any>;
  advisories: { [key: string]: any };
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

const parseAudit = (audit: Audit): Result<Audit['metadata']> => {
  const vulnerabilities = audit.metadata.vulnerabilities;
  const sumOfVulnerabilities = Object.keys(vulnerabilities).reduce(
    (sum, key) => sum + vulnerabilities[key],
    0
  );
  const isOkay = vulnerabilities.high + vulnerabilities.critical === 0;
  const shortText = `info: ${vulnerabilities.info} low: ${vulnerabilities.low} moderate: ${vulnerabilities.moderate} high: ${vulnerabilities.high} critical: ${vulnerabilities.critical}`;
  const metadata = audit.metadata;
  const text = `${sumOfVulnerabilities} ${
    sumOfVulnerabilities === 1 ? 'vulnerability' : 'vulnerabilities'
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

export async function runAudit(
  context: GitHubContext<{}>
): Promise<Result<Audit['metadata']>> {
  let output = '';
  const options = {
    ignoreReturnCode: true,
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
    const workingDirectory = core.getInput('workingDirectory');
    const auditResultDirectory = core.getInput('actionName');
    if (workingDirectory) {
      const [owner, repo] = context.repository.split('/');
      const execPath = path.join(
        process.env.RUNNER_WORKSPACE as string,
        repo,
        workingDirectory
      );
      options['cwd'] = execPath;
    }
    await exec('npm', ['audit', '--json', '--audit-level=moderate'], options);
    console.log('output: ', output);
    const auditResult: Audit = JSON.parse(output);
    fs.mkdirSync(auditResultDirectory);
    fs.writeFileSync(
      path.join(auditResultDirectory, 'index.html'),
      generateAuditDetails(auditResult)
    );
    return parseAudit(auditResult);
  } catch (error) {
    console.error('error: ', error);
    throw error;
  }
}
