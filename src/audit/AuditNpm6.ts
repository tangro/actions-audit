import { marked } from 'marked';
import { getSeverity, getSeverityStyle } from './auditDetails';

export interface AuditNpm6 {
  actions: Array<any>;
  muted: Array<any>;
  advisories: Record<string, any>;
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

export const generateDetailsNpm6 = (auditResult: AuditNpm6) => {
  return `<ul>
      ${Object.values(auditResult.advisories || {})
        .sort(
          (findingA, findingB) =>
            getSeverity(findingA.severity) - getSeverity(findingB.severity)
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
      </ul>`;
};
