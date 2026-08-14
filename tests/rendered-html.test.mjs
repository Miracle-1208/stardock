import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the StarDock product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /StarDock/);
  assert.match(html, /发现课程舱/);
  assert.match(html, /欢迎回来，Lucian/);
  assert.match(html, /我的课程舱/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps shared course assets separate from private study state", async () => {
  const [page, community] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dock-community.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /layer:\s*"shared"\s*\|\s*"personal"/);
  assert.match(page, /私人学习层/);
  assert.match(page, /onPracticeEvidence/);
  assert.match(community, /保持与原课程舱更新连接/);
  assert.match(community, /个人题册、学习记录和 Agent 对话默认私密/);
  assert.match(community, /发布课程舱/);
});
