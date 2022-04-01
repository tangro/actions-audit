import { getSeverity, getSeverityStyle } from './auditDetails';
import { Audit } from './runAudit';

interface VulnerabilityNpm7 {
  name: string;
  severity: string;
  isDirect: boolean;
  via: Array<string>;
  effects: Array<string>;
  range: string;
  nodes: Array<string>;
  fixAvailable: {
    name: string;
    version: string;
    isSemVerMajor: boolean;
  };
}

export interface AuditNpm7 {
  auditReportVersion: string;
  vulnerabilities: Record<string, VulnerabilityNpm7>;
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

export const isAuditNpm7 = (audit: Audit): audit is AuditNpm7 => {
  return (audit as AuditNpm7).auditReportVersion !== undefined;
};

export const isAuditMeatDataNpm7 = (
  audit: Audit['metadata']
): audit is AuditNpm7['metadata'] => {
  return (audit as AuditNpm7['metadata']).dependencies.total !== undefined;
};

export const generateDetailsNpm7 = (auditResult: AuditNpm7) => {
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
        Patched versions: ${finding.fixAvailable.version}</br>
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
