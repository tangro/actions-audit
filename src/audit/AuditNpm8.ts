import { getSeverity, getSeverityStyle } from './auditDetails';

interface VulnerabilityNpm8 {
  name: string;
  severity: string;
  isDirect: boolean;
  via: Array<string>;
  effects: Array<string>;
  range: string;
  nodes: Array<string>;
  fixAvailable: boolean;
}

export interface AuditNpm8 {
  auditReportVersion: string;
  vulnerabilities: Record<string, VulnerabilityNpm8>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
    };
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
}

export const generateDetailsNpm8 = (auditResult: AuditNpm8) => {
  return `<ul>
  ${Object.values(auditResult.vulnerabilities || {})
    .sort(
      (findingA, findingB) =>
        getSeverity(findingA.severity) - getSeverity(findingB.severity)
    )
    .map(finding => {
      return `
      <li>
        <strong ${getSeverityStyle(finding.severity)}>ModuleName: ${
        finding.name
      } (${finding.severity})</strong></br>
        Patched: ${finding.fixAvailable} (Problem range ${finding.range})</br>
        ${
          finding.effects.length > 0
            ? `Used in Packages: ${finding.effects.join(', ')}`
            : ''
        }
      </li>`;
    })
    .join('</br>')}
  </ul>`;
};
