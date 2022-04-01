import { Result } from '@tangro/tangro-github-toolkit';
import { isAuditMeatDataNpm7 } from './AuditNpm7';
import { Audit } from './runAudit';

export function createCommentText(audit: Result<Audit['metadata']>): string {
  if (audit.isOkay) {
    return `\n## audit summary
0 vulnerabilities detected in ${
      isAuditMeatDataNpm7(audit.metadata)
        ? audit.metadata.dependencies.total
        : audit.metadata.totalDependencies
    } total dependencies`;
  } else {
    return `\n## audit summary\n\n
${audit.text}`;
  }
}
