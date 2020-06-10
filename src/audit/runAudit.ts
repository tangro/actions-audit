import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as fs from 'fs';
import path from 'path';
import { Result, GitHubContext } from '@tangro/tangro-github-toolkit';

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
    text,
  };
};

export async function runAudit(
  context: GitHubContext<{}>
): Promise<Result<Audit['metadata']>> {
  let output = '';
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        output += data.toString();
      },
    },
  };
  try {
    const workingDirectory = core.getInput('workingDirectory');
    if (workingDirectory) {
      const [owner, repo] = context.repository.split('/');

      console.log('RUNNER_WORKSPACE: ', process.env.RUNNER_WORKSPACE);
      console.log('repo: ', repo);
      console.log('workingDirectory: ', workingDirectory);

      const execPath = path.join(
        process.env.RUNNER_WORKSPACE as string,
        repo,
        workingDirectory
      );
      console.log('execPath: ', execPath);

      options['cwd'] = execPath;
    }
    await exec('npm', ['audit', '--json', '--audit-level=moderate'], options);
    console.log(output);
    const auditResult: Audit = JSON.parse(output);
    fs.mkdirSync('audit');
    fs.writeFileSync(
      path.join('audit', 'index.html'),
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
