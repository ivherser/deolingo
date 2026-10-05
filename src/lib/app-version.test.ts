import { describe, expect, it } from "vitest";
import { appVersion } from "@/lib/app-version";

describe("appVersion", () => {
  it('uses the Vercel pull request id as "1.<id>"', () => {
    expect(appVersion({ VERCEL_GIT_PULL_REQUEST_ID: "12" })).toBe("1.12");
  });

  it("falls back to the pull request number in a merge commit message", () => {
    expect(
      appVersion({
        VERCEL_GIT_PULL_REQUEST_ID: "",
        VERCEL_GIT_COMMIT_MESSAGE: "Merge pull request #10 from ivherser/x",
      }),
    ).toBe("1.10");
  });

  it("supports squash commit messages", () => {
    expect(appVersion({ VERCEL_GIT_COMMIT_MESSAGE: "feat: x (#11)" })).toBe("1.11");
  });

  it("uses the first pull request number in the commit message", () => {
    expect(
      appVersion({ VERCEL_GIT_COMMIT_MESSAGE: "Merge #10, later mention #20" }),
    ).toBe("1.10");
  });

  it("falls back to the commit message when the Vercel PR id is not numeric", () => {
    expect(
      appVersion({
        VERCEL_GIT_PULL_REQUEST_ID: "abc",
        VERCEL_GIT_COMMIT_MESSAGE: "Merge pull request #13 from ivherser/x",
      }),
    ).toBe("1.13");
  });

  it.each([
    { VERCEL_GIT_COMMIT_MESSAGE: "feat: no pull request number" },
    {},
  ])("falls back to 1.dev when no pull request number is available", (env) => {
    expect(appVersion(env)).toBe("1.dev");
  });
});
