import assert from "node:assert/strict";
import test from "node:test";
import { WorkflowAgent } from "../src/agent.js";

test("WorkflowAgent binds extensions before prompting subagents", async () => {
  const calls: string[] = [];
  const session = {
    messages: [{ role: "assistant", content: [{ type: "text", text: "done" }] }],
    async bindExtensions() {
      calls.push("bind");
    },
    async prompt(prompt: string) {
      calls.push(`prompt:${prompt}`);
    },
    abort() {
      calls.push("abort");
    },
    dispose() {
      calls.push("dispose");
    },
  };

  const agent = new WorkflowAgent({
    tools: [],
    createSession: async () => ({ session }) as any,
  });

  const result = await agent.run("write report");

  assert.equal(result, "done");
  assert.deepEqual(calls, ["bind", "prompt:write report", "dispose"]);
});
