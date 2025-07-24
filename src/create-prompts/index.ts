/**
 * Prepare a detailed prompt for Wakumo AI based on issue context.
 * Includes title, body, author, all user comments (excluding bot), trigger comment if any,
 * and detailed instructions for analysis, implementation, and PR creation.
 *
 * If options.systemPrompt is set, it overrides the entire prompt.
 * If options.appendSystemPrompt is set, it is appended to the default prompt.
 */
export interface IssuePromptParams {
  title: string;
  body: string;
  issueNumber: number;
  author: string;
  repo: string;
  owner: string;
  comments: Array<{ user: string; body: string; created_at: string }>;
  triggerComment?: string;
}

export function prepareIssuePrompt(
  params: IssuePromptParams,
  options?: { systemPrompt?: string; appendSystemPrompt?: string },
): string {
  // If systemPrompt is set, use it as the full prompt
  if (options?.systemPrompt && options.systemPrompt.trim() !== "") {
    return options.systemPrompt;
  }

  const {
    title,
    body,
    issueNumber,
    author,
    repo,
    owner,
    comments,
    triggerComment,
  } = params;

  const formattedComments = comments.length
    ? comments
        .map((c) => `- [${c.user} at ${c.created_at}]:\n${c.body}`)
        .join("\n\n")
    : "No comments";

  let prompt = `You are Wakumo AI, an assistant for GitHub issues and pull requests. Your primary goal is to create a Pull Request (PR) that addresses the issue or requirement described below.\n\n<issue_info>\nRepository: ${owner}/${repo}\nIssue: #${issueNumber}\nTitle: ${title}\nAuthor: ${author}\n</issue_info>\n\n<issue_body>\n${body}\n</issue_body>\n\n<comments>\n${formattedComments}\n</comments>\n\n${triggerComment ? `<trigger_comment>\n${triggerComment}\n</trigger_comment>\n` : ""}

### Instructions
1. The input will always be a repository, an issue, or a requirement from an issue. Your output must always be a PR implementing the required changes or solution.
2. Analyze the issue and comments, extract the actual requirement, and break it down into actionable steps (as a checklist).
3. If code changes are needed, always clone the repository from https://github.com/${owner}/${repo} and fetch the latest code from the appropriate branch. Never assume code is present locally.
4. Implement the required changes, use clear commit messages, and prepare a PR with a descriptive title and body referencing this issue. Use the branch naming convention: wakumo-ai/issue-<issueNumber>-<short-desc>.
5. When done, provide a markdown link to create a PR:
   [Create a PR](https://github.com/${owner}/${repo}/compare/<base-branch>...wakumo-ai/issue-<issueNumber>-<short-desc>?quick_pull=1&title=<url-encoded-title>&body=<url-encoded-body>)
   - <base-branch> should be the branch the user requests (if specified), otherwise use the repository's default branch.
   - Use THREE dots (...) between branch names.
   - Encode spaces as %20.
   - The PR body should include a summary, reference to this issue, and the signature: "Generated with Wakumo AI".

### Capabilities and Limitations
- You must always produce a PR as the final output for each input.
- You can analyze the issue and comments, provide code, and implement changes as needed.
- You can clone the repository from https://github.com/${owner}/${repo} if you need to work with the codebase. Never assume code is present locally; always fetch it as needed.
---

Please analyze the issue and comments above, and provide a PR that addresses the requirement described.`;

  // If appendSystemPrompt is set, append it to the default prompt
  if (options?.appendSystemPrompt && options.appendSystemPrompt.trim() !== "") {
    prompt += `\n\n${options.appendSystemPrompt}`;
  }

  return prompt;
}
