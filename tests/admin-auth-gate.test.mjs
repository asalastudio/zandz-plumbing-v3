import assert from "node:assert/strict";
import test from "node:test";

// Run against a production build: `npm run build && npm start`, then
// OS_TEST_BASE_URL=http://localhost:3000 npm run test:integration.
// Point SUPABASE_URL at something unreachable so no real data is involved.
const baseUrl = process.env.OS_TEST_BASE_URL ?? "http://localhost:3100";

// What the client router sends on a soft navigation from the dashboard. A
// layout-only auth check is skipped for this request shape, which is how
// admin pages could be read without logging in.
const routerTreeFromDashboard = encodeURIComponent(
  JSON.stringify([
    "",
    { children: ["admin", { children: ["(authed)", { children: ["__PAGE__", {}] }] }] },
  ])
);

const adminPages = ["/admin/", "/admin/customers/", "/admin/jobs/", "/admin/customers/new/", "/field/"];

for (const path of adminPages) {
  test(`${path} redirects to login without a session`, async () => {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status), `got ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/login\//);
  });

  test(`${path} redirects to login for a crafted RSC navigation`, async () => {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      headers: { RSC: "1", "Next-Router-State-Tree": routerTreeFromDashboard },
    });
    assert.ok([307, 308].includes(response.status), `got ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/login\//);
  });
}

test("a forged session cookie is rejected", async () => {
  const response = await fetch(`${baseUrl}/admin/customers/`, {
    redirect: "manual",
    headers: { Cookie: "zz_admin=Fe26.2*1*forged*value" },
  });
  assert.ok([307, 308].includes(response.status), `got ${response.status}`);
});

test("the login page itself stays reachable", async () => {
  const response = await fetch(`${baseUrl}/admin/login/`, { redirect: "manual" });
  assert.equal(response.status, 200);
});
