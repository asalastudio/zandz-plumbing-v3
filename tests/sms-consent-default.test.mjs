import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("booking form requires customers to affirmatively opt in to SMS", async () => {
  const source = await readFile(
    new URL("../components/BookingForm.tsx", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /smsConsent:\s*false,/,
    "SMS consent must be unchecked by default"
  );
  assert.match(source, /Reply STOP to opt out\./);
});
