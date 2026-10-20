import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.OS_TEST_BASE_URL ?? "http://localhost:3100";

test("Twilio inbound webhook fails closed in production when auth is not configured", async () => {
  const response = await fetch(`${baseUrl}/api/webhooks/twilio/inbound/`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "",
  });

  assert.equal(response.status, 503);
  assert.match(await response.text(), /Twilio not configured/i);
});

test("Twilio status callback fails closed when auth is not configured", async () => {
  const response = await fetch(`${baseUrl}/api/webhooks/twilio/status/`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "MessageSid=SM_test&MessageStatus=delivered",
  });

  assert.equal(response.status, 503);
  assert.match(await response.text(), /Twilio not configured/i);
});
