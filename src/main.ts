import * as core from '@actions/core';
import {
  GitHubContext,
  createComment,
  wrapWithSetStatus
} from '@tangro/tangro-github-toolkit';
import { runAudit } from './audit/runAudit';
import { createCommentText } from './audit/comment';

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
    ) as GitHubContext<{}>;

    console.log({ sha: context.sha });

    const actionName = core.getInput('actionName') || 'audit';
    const result = await wrapWithSetStatus(context, actionName, async () => {
      return await runAudit(context);
    });

    if (core.getInput('post-comment') === 'true' && result) {
      createComment({
        context,
        comment: createCommentText(result)
      });
    }
  } catch (error: any) {
    console.log(error);
    core.setFailed(error.message);
  }
}

run();
