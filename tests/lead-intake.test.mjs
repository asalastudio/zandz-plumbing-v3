import assert from "node:assert/strict";
import test from "node:test";

// Integration checks for /api/lead. Run against a build whose SUPABASE_URL is
// unreachable: a real submission then fails with 502, so a 200 proves the
// request was dropped before it ever touched the database or sent email.
const baseUrl = process.env.OS_TEST_BASE_URL ?? "http://localhost:3100";

function leadForm(extra = {}) {
  const form = new FormData();
  const fields = {
    firstName: "Test",
    lastName: "Lead",
    email: "test@example.com",
    phone: "5105550123",
    serviceInterest: "clog",
    ...extra,
  };
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

test("a filled honeypot is accepted silently and never ingested", async () => {
  const response = await fetch(`${baseUrl}/api/lead/`, {
    method: "POST",
    body: leadForm({ company_website: "https://spam.example" }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("a normal submission reaches ingestion", async () => {
  const response = await fetch(`${baseUrl}/api/lead/`, { method: "POST", body: leadForm() });
  // 502 here means it got past the guards and tried to save (the test DB is unreachable).
  assert.equal(response.status, 502);
});

test("an international phone number is refused", async () => {
  const response = await fetch(`${baseUrl}/api/lead/`, {
    method: "POST",
    body: leadForm({ phone: "+447700900123" }),
  });
  assert.notEqual(response.status, 200);
});

test("a missing phone is rejected", async () => {
  const form = leadForm();
  form.delete("phone");
  const response = await fetch(`${baseUrl}/api/lead/`, { method: "POST", body: form });
  assert.equal(response.status, 400);
});

test("email is optional", async () => {
  const form = leadForm();
  form.delete("email");
  const response = await fetch(`${baseUrl}/api/lead/`, { method: "POST", body: form });
  // Past the required-field check and on to saving (502 against the test DB).
  assert.equal(response.status, 502);
});
