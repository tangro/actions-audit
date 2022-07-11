import { AuditNpm8, generateDetailsNpm8 } from './AuditNpm8';
import { AuditNpm7, generateDetailsNpm7 } from './AuditNpm7';
import { AuditNpm6, generateDetailsNpm6 } from './AuditNpm6';
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

const generateDetailsForNmpVersion = (auditResult: Audit, version: number) => {
  switch (version) {
    case 6:
      return generateDetailsNpm6(auditResult as AuditNpm6);
    case 7:
      return generateDetailsNpm7(auditResult as AuditNpm7);
    case 8:
    default:
      return generateDetailsNpm8(auditResult as AuditNpm8);
  }
};

export const generateAuditDetails = (auditResult: Audit, version: number) => {
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
      ${generateDetailsForNmpVersion(auditResult, version)}
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
