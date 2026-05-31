import assert from "node:assert/strict";
import test from "node:test";
import { DefaultResourceLoader, type ExtensionFactory, getAgentDir } from "@earendil-works/pi-coding-agent";
import { WorkflowAgent } from "../src/agent.js";

test("WorkflowAgent runs extension session_start before subagent input handlers", async () => {
  let sessionStarted = false;
  const inputObservedSessionStarted: boolean[] = [];
  const extension: ExtensionFactory = (pi) => {
    pi.on("session_start", () => {
      sessionStarted = true;
    });
    pi.on("input", () => {
      inputObservedSessionStarted.push(sessionStarted);
      return { action: "handled" };
    });
  };

  const cwd = process.cwd();
  const resourceLoader = new DefaultResourceLoader({
    cwd,
    agentDir: getAgentDir(),
    extensionFactories: [extension],
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  });
  await resourceLoader.reload();

  const agent = new WorkflowAgent({
    cwd,
    tools: [],
    session: { resourceLoader },
  });

  const result = await agent.run("write report");

  assert.equal(result, "");
  assert.deepEqual(inputObservedSessionStarted, [true]);
});
