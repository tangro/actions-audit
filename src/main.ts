import * as core from '@actions/core';
import { GitHubContext, setStatus } from '@tangro/tangro-github-toolkit';
import { runAudit } from './audit/runAudit';
import { Result } from './Result';

async function wrapWithSetStatus<T>(
  context: GitHubContext,
  step: string,
  code: () => Promise<Result<T>>
) {
  setStatus({
    context,
    step,
    description: `Running ${step}`,
    state: 'pending'
  });

  try {
    const result = await code();
    setStatus({
      context,
      step,
      description: result.shortText,
      state: result.isOkay ? 'success' : 'failure'
    });
    return result;
  } catch (error) {
    setStatus({
      context,
      step,
      description: `Failed: ${step}`,
      state: 'failure'
    });
    core.setFailed(`CI failed at step: ${step}`);
  }
}

async function run() {
  try {
    if (
      !process.env.GITHUB_CONTEXT ||
      process.env.GITHUB_CONTEXT.length === 0
    ) {
      throw new Error(
        'You have to set the GITHUB_CONTEXT in your secrets configuration'
      );
    }
    if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN.length === 0) {
      throw new Error(
        'You have to set the GITHUB_TOKEN in your secrets configuration'
      );
    }
    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext;

    await wrapWithSetStatus(context, 'audit', async () => {
      return await runAudit();
    });

    core.debug('debug message');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
