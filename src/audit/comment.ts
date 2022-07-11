import { Result } from '@tangro/tangro-github-toolkit';
import { Audit, getTotalDependencies } from './runAudit';

export function createCommentText(audit: Result<Audit['metadata']>): string {
  if (audit.isOkay) {
    return `\n## audit summary
0 vulnerabilities detected in ${getTotalDependencies(
      audit.metadata
    )} total dependencies`;
  } else {
    return `\n## audit summary\n\n
${audit.text}`;
  }
}
