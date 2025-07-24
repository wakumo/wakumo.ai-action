# Wakumo AI Minimal GitHub Action

This GitHub Action listens for the `@wakumo-ai` tag in issues, comments, or reviews. When triggered, it creates a new Wakumo AI conversation and comments the conversation link back to the issue or pull request.

## Features

- Triggered by `@wakumo-ai` mention in issues, comments, or reviews
- Creates a new conversation using Wakumo AI
- Comments the conversation link or ID back to the relevant issue or PR
- Minimal, fast, and easy to use
- **Highly customizable prompt** via `system_prompt` and `append_system_prompt` inputs

## Usage

Add this action to your workflow:

```yaml
name: Wakumo AI Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request_review:
    types: [submitted]

jobs:
  wakumo:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@wakumo-ai')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@wakumo-ai')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@wakumo-ai')) ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@wakumo-ai') || contains(github.event.issue.title, '@wakumo-ai')))
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Run WakumoAI Action Code
        id: wakumo-ai
        uses: wakumo/wakumo-ai-action@beta
        with:
          wkm_api_key: ${{ secrets.WKM_API_KEY }}
          # Optional: override the Wakumo AI API endpoint (e.g. for staging or self-hosted)
          # wkm_api_url: "https://api.staging.wakumo.ai"
          # Optional: override the entire prompt (see below)
          # system_prompt: |
          #   You are a strict code reviewer. Only answer in Vietnamese.
          # Optional: append extra instructions to the default prompt
          # append_system_prompt: |
          #   Always check for security issues in authentication code.
```

### Inputs

- `wkm_api_key` (**required**): Your Wakumo AI API key. Store this as a secret in your repository.
- `wkm_api_url` (optional): Override the Wakumo AI API endpoint.
- `system_prompt` (optional): **Override the entire prompt** sent to Wakumo AI. If set, this will be used as the full prompt and the default prompt will be ignored.
- `append_system_prompt` (optional): **Append extra instructions** to the default prompt. If set, this will be added to the end of the default prompt.

## Prompt Customization

- Use `system_prompt` if you want to take full control of the prompt sent to Wakumo AI. This will replace all default context and instructions.
- Use `append_system_prompt` if you want to add extra rules, guidelines, or context to the default prompt (e.g. "Always check for security issues").
- If both are set, `system_prompt` takes precedence and the default prompt will be ignored.

## How it works

1. Listens for GitHub events (issue, comment, review, etc.)
2. Checks for the `@wakumo-ai` tag in the relevant fields
3. Calls Wakumo AI to create a new conversation
4. Comments the conversation link or ID back to the issue or PR

## Examples

Here are some example triggers and expected bot replies:

### Example 1: Issue comment

**User comments:**

```
@wakumo-ai Can you help me refactor this function?
```

**Bot replies:**

```
Wakumo AI conversation created: https://app.wakumo.ai/conversation/1234567890abcdef
```

### Example 2: Issue body

**Issue body:**

```
Title: [Bug] @wakumo-ai cannot parse this file

Body: @wakumo-ai Please investigate why this file is not being parsed correctly.
```

**Bot replies as a comment:**

```
Wakumo AI conversation created: https://app.wakumo.ai/conversation/abcdef1234567890
```

### Example 3: PR review comment

**Reviewer writes:**

```
@wakumo-ai Suggest improvements for this code block.
```

**Bot replies:**

```
Wakumo AI conversation created: https://app.wakumo.ai/conversation/9876543210fedcba
```

### Example 4: Issue title

**Issue title:**

```
@wakumo-ai: Please analyze this bug
```

**Bot replies as a comment:**

```
Wakumo AI conversation created: https://app.wakumo.ai/conversation/1122334455667788
```

---

## License

MIT
