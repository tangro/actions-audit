import { Result } from '../Result';
import { Audit } from './runAudit';

export function createCommentText(audit: Result<Audit['metadata']>): string {
  if (audit.isOkay) {
    return `\n## audit summary
0 vulnerabilities detected in ${audit.metadata.totalDependencies} total dependencies`;
  } else {
    return `\n## audit summary\n\n
${audit.text}`;
  }
}
