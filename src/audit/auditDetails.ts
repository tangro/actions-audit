import { Audit } from './runAudit';
import { marked } from 'marked';

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case 'info':
      return '';
    case 'low':
      return 'style="color:#2680c2"';
    case 'moderate':
      return 'style="color:#c65d21"';
    case 'high':
      return 'style="color:#ba2525"';
    case 'critical':
      return 'style="color:#610404"';
    default:
      '';
  }
};

const getSeverity = ({ severity }: { severity: string }): number => {
  switch (severity) {
    case 'info':
      return 5;
    case 'low':
      return 4;
    case 'moderate':
      return 3;
    case 'high':
      return 2;
    case 'critical':
      return 1;
    default:
      return 0;
  }
};

export const generateAuditDetails = (auditResult: Audit) => {
  const copyOfAuditResult = { ...auditResult };
  const vulnerabilities = JSON.stringify(
    auditResult.metadata.vulnerabilities,
    null,
    2
  );

  return `
  <html>
    <body>
      <strong>Vulnerabilities</strong>
      <pre><code>${vulnerabilities}</code></pre>
      <ul>
      ${Object.values(auditResult.advisories)
        .sort(
          (findingA, findingB) => getSeverity(findingA) - getSeverity(findingB)
        )
        .map(finding => {
          return `
          <li>
            <strong ${getSeverityStyle(finding.severity)}>ModuleName: ${
            finding.module_name
          } (${finding.severity})</strong></br>
            Problem: ${finding.title}
            ${marked(finding.overview)}
            Patched versions: ${finding.patched_versions}</br>
            ${finding.findings
              .map(result => `paths: ${result.paths} (${result.version})`)
              .join('</br>')}
          </li>`;
        })
        .join('</br>')}
      </ul>
      </br>
      <details>
        <summary>Full audit.json</summary>
        <p><pre><code>${JSON.stringify(
          copyOfAuditResult,
          null,
          2
        )}</code></pre></p>
      </details>
    </body>
  </html>`;
};
