# Wakumo AI Minimal GitHub Action

This GitHub Action listens for the `@wakumo-ai` tag in issues, comments, or reviews. When triggered, it creates a new Wakumo AI conversation and comments the conversation link back to the issue or pull request.

## Features

- Triggered by `@wakumo-ai` mention in issues, comments, or reviews
- Creates a new conversation using Wakumo AI
- Comments the conversation link or ID back to the relevant issue or PR
- Minimal, fast, and easy to use

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
          WKM_API_KEY: ${{ secrets.WKM_API_KEY }}
```

### Inputs

- `WKM_API_KEY` (**required**): Your Wakumo AI API key. Store this as a secret in your repository.

## How it works

1. Listens for GitHub events (issue, comment, review, etc.)
2. Checks for the `@wakumo-ai` tag in the relevant fields
3. Calls Wakumo AI to create a new conversation
4. Comments the conversation link or ID back to the issue or PR

## License

MIT
