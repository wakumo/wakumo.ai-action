import * as core from "@actions/core";
import * as github from "@actions/github";
import { WakumoAIClient } from "wakumo-ai-sdk-js";
import { prepareIssuePrompt } from "../create-prompts/index";

async function run() {
  try {
    const apiKey = core.getInput("WKM_API_KEY", { required: true });
    const apiUrl = core.getInput("WKM_API_URL");
    const context = github.context;
    const payload = context.payload;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN!);
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // Check for @wakumo-ai in comment, issue body, or review body
    const body =
      payload.comment?.body ||
      payload.issue?.body ||
      payload.review?.body ||
      "";
    const title = payload.issue?.title || "";
    if (!body.includes("@wakumo-ai") && !title.includes("@wakumo-ai")) {
      console.log("No @wakumo-ai tag found. Exiting.");
      return;
    }

    // If this is an issue event, fetch all comments (excluding bot comments)
    let allUserComments: Array<{
      user: string;
      body: string;
      created_at: string;
    }> = [];
    let issueNumber =
      payload.issue?.number || payload.pull_request?.number || 0;
    let author =
      payload.issue?.user?.login ||
      payload.pull_request?.user?.login ||
      "unknown";
    if (payload.issue) {
      const commentsResp = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      });
      // Log all comment user logins for debugging
      console.log(
        "All comment user logins:",
        commentsResp.data.map((c) => c.user?.login),
      );
      allUserComments = commentsResp.data
        .filter((c) => {
          const login = c.user?.login || "";
          return (
            !login.includes("wakumo-ai[bot]") && !login.includes("wakumo-ai")
          );
        })
        .map((c) => ({
          user: c.user?.login || "unknown",
          body: c.body || "",
          created_at: c.created_at || "",
        }));
    }

    // If this is a comment event, set triggerComment
    let triggerComment: string | undefined = undefined;
    if (payload.comment?.body) {
      triggerComment = payload.comment.body;
    }

    // Read system_prompt and append_system_prompt from environment
    const systemPrompt = process.env.SYSTEM_PROMPT || "";
    const appendSystemPrompt = process.env.APPEND_SYSTEM_PROMPT || "";

    // Build the prompt using the new options logic
    const prompt = prepareIssuePrompt(
      {
        title,
        body: payload.issue?.body || "",
        issueNumber,
        author,
        repo,
        owner,
        comments: allUserComments,
        triggerComment,
      },
      {
        systemPrompt,
        appendSystemPrompt,
      },
    );

    // Create WakumoAIClient
    const initParams: { apiKey: string; apiUrl?: string } = { apiKey };
    if (apiUrl && apiUrl.trim() !== "") {
      initParams.apiUrl = apiUrl;
    }
    const client = new WakumoAIClient(initParams);

    // Create a conversation with the final prompt
    const conversation = await client.conversation.create(prompt);

    // Compose the comment message
    const conversationLink = `https://app.wakumo.ai/conversation/${conversation.id}`;
    const message = `Wakumo AI conversation created: ${conversationLink}`;

    // Post a comment back to the issue/PR
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: message,
    });
  } catch (error) {
    core.setFailed(`Action failed: ${error}`);
  }
}

run();
