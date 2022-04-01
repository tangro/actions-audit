import { generateDetailsNpm7, isAuditNpm7 } from './AuditNpm7';
import { generateDetailsNpm6 } from './AuditNpm6';
import { Audit } from './runAudit';

export const getSeverityStyle = (severity: string) => {
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

export const getSeverity = (severity: string): number => {
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
      ${
        isAuditNpm7(auditResult)
          ? generateDetailsNpm7(auditResult)
          : generateDetailsNpm6(auditResult)
      }
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
