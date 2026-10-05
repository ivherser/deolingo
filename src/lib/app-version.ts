export function appVersion(env: {
  VERCEL_GIT_PULL_REQUEST_ID?: string;
  VERCEL_GIT_COMMIT_MESSAGE?: string;
}): string {
  const pullRequestId = env.VERCEL_GIT_PULL_REQUEST_ID;
  if (pullRequestId && /^\d+$/.test(pullRequestId)) {
    return `1.${pullRequestId}`;
  }

  const commitPullRequestNumber = env.VERCEL_GIT_COMMIT_MESSAGE?.match(/#(\d+)/)?.[1];
  return commitPullRequestNumber ? `1.${commitPullRequestNumber}` : "1.dev";
}
