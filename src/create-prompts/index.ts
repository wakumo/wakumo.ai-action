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
  options?: { systemPrompt?: string; appendSystemPrompt?: string }
): string {
  // If systemPrompt is set, use it as the full prompt
  if (options?.systemPrompt && options.systemPrompt.trim() !== "") {
    return options.systemPrompt;
  }

  const { title, body, issueNumber, author, repo, owner, comments, triggerComment } = params;

  const formattedComments = comments.length
    ? comments
        .map(
          (c) => `- [${c.user} at ${c.created_at}]:\n${c.body}`
        )
        .join("\n\n")
    : "No comments";

  let prompt = `You are Wakumo AI, an assistant for GitHub issues and pull requests. Think carefully as you analyze the context and respond appropriately.\n\n<issue_info>\nRepository: ${owner}/${repo}\nIssue: #${issueNumber}\nTitle: ${title}\nAuthor: ${author}\n</issue_info>\n\n<issue_body>\n${body}\n</issue_body>\n\n<comments>\n${formattedComments}\n</comments>\n\n${triggerComment ? `<trigger_comment>\n${triggerComment}\n</trigger_comment>\n` : ""}

<event_type>ISSUE_CREATED</event_type>
<trigger_context>new issue with '@wakumo-ai' in body or comment</trigger_context>

### Instructions
1. **Create a Todo List:**
   - Analyze the issue and comments above, and break down the request into actionable steps.
   - Format todos as a checklist (- [ ] for incomplete, - [x] for complete).

2. **Analyze the Request:**
   - Carefully read the issue body and all comments above.
   - Extract the actual question or request from the trigger comment or issue body.
   - If the request is for code, provide code blocks and explanations.
   - If the request is a bug, suggest debugging steps or fixes.
   - If the request is a question, answer as clearly as possible.

3. **Implementation & PR Workflow:**
   - If code changes are needed, describe your plan and required files.
   - Use a branch naming convention: wakumo-ai/issue-<issueNumber>-<short-desc>
   - When done, provide a markdown link to create a PR:
     [Create a PR](https://github.com/${owner}/${repo}/compare/<base-branch>...wakumo-ai/issue-<issueNumber>-<short-desc>?quick_pull=1&title=<url-encoded-title>&body=<url-encoded-body>)
     - <base-branch> should be the branch the user requests (e.g. develop, release/1.2, etc.) if mentioned in the issue or comments. If not specified, use the repository's default branch (often 'main' or 'master').
     - Use THREE dots (...) between branch names.
     - Encode spaces as %20.
     - The PR body should include a summary, reference to this issue, and the signature: "Generated with Wakumo AI".
   - Use clear, descriptive commit messages. If possible, include a co-author line for the issue author.

### Capabilities and Limitations
- You can:
  - Analyze the issue and comments, and provide helpful suggestions, code, or next steps
  - Implement code changes (simple to moderate complexity) when explicitly requested
  - Propose a pull request for changes to human-authored code
- You cannot:
  - Submit formal GitHub PR reviews
  - Approve pull requests
  - Execute commands outside the repository context
  - Run arbitrary Bash commands (unless explicitly allowed)
  - Modify files in the .github/workflows directory

---

Please analyze the issue and comments above, and provide helpful suggestions, code, or next steps if possible.`;

  // If appendSystemPrompt is set, append it to the default prompt
  if (options?.appendSystemPrompt && options.appendSystemPrompt.trim() !== "") {
    prompt += `\n\n${options.appendSystemPrompt}`;
  }

  return prompt;
}