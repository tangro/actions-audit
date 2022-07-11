import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as fs from 'fs';
import path from 'path';
import { Result, GitHubContext } from '@tangro/tangro-github-toolkit';
import { generateAuditDetails } from './auditDetails';
import { AuditNpm8 } from './AuditNpm8';
import { AuditNpm7 } from './AuditNpm7';
import { AuditNpm6 } from './AuditNpm6';

export type Audit = AuditNpm6 | AuditNpm7 | AuditNpm8;

export const getTotalDependencies = (metadata: Audit['metadata']) => {
  return (metadata as any).totalDependencies
    ? (metadata as any).totalDependencies
    : (metadata as any).dependencies.total;
};

const parseAudit = (audit: Audit): Result<Audit['metadata']> => {
  const vulnerabilities = audit.metadata.vulnerabilities;
  core.setOutput('vulnerabilities', JSON.stringify(vulnerabilities));
  const sumOfVulnerabilities = Object.keys(vulnerabilities).reduce(
    (sum, key) => sum + vulnerabilities[key],
    0
  );
  const isOkay = vulnerabilities.high + vulnerabilities.critical === 0;
  const shortText = `info: ${vulnerabilities.info} low: ${vulnerabilities.low} moderate: ${vulnerabilities.moderate} high: ${vulnerabilities.high} critical: ${vulnerabilities.critical}`;
  const metadata = audit.metadata;
  const text = `${sumOfVulnerabilities} ${
    sumOfVulnerabilities === 1 ? 'vulnerability' : 'vulnerabilities'
  } detected in ${getTotalDependencies(metadata)} total dependencies:
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
  let versionOutput = '';
  const versionOptions = {
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        versionOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        versionOutput += data.toString();
      }
    }
  };
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
    const auditResultDirectory = core.getInput('actionName') || 'audit';
    const productionOnly = core.getInput('production') === 'true';
    const auditLevel = core.getInput('auditLevel') || 'moderate';

    if (workingDirectory) {
      const [owner, repo] = context.repository.split('/');
      const execPath = path.join(
        process.env.RUNNER_WORKSPACE as string,
        repo,
        workingDirectory
      );
      options['cwd'] = execPath;
    }
    const params = ['audit', '--json', `--audit-level=${auditLevel}`];
    await exec('npm --version', [], versionOptions);
    const version = JSON.parse(versionOutput).split('.')[0];

    if (productionOnly) {
      params.push(version >= 8 ? '--omit=dev' : '--production');
    }

    await exec('npm', params, options);
    console.log('output: ', output);
    const auditResult: Audit = JSON.parse(output);
    fs.mkdirSync(auditResultDirectory);
    fs.writeFileSync(
      path.join(auditResultDirectory, 'index.html'),
      generateAuditDetails(auditResult, version)
    );
    return parseAudit(auditResult);
  } catch (error) {
    console.error('error: ', error);
    throw error;
  }
}
