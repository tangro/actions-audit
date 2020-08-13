import { Audit } from './runAudit';

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
      ${Object.keys(auditResult.advisories)
        .map((key) => {
          const finding = auditResult.advisories[key];
          return `
          <li>
            <strong ${getSeverityStyle(finding.severity)}>ModuleName: ${
            finding.module_name
          } (${finding.severity})</strong></br>
            Problem: ${finding.title}</br>
            ${finding.overview}</br></br>
            Patched versions: ${finding.patched_versions}</br>
            ${finding.findings
              .map((result) => `paths: ${result.paths} (${result.version})`)
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
