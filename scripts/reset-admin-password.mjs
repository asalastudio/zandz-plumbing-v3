#!/usr/bin/env node
/**
 * Reset the Z and Z OS admin password.
 *
 * Prompts for a new password (hidden, entered twice), hashes it with bcrypt,
 * and stores only the hash as ADMIN_PASSWORD_HASH on the Vercel production
 * environment. The plain password never touches disk, the shell history, or
 * the process list.
 *
 *   node scripts/reset-admin-password.mjs           # production (Vercel)
 *   node scripts/reset-admin-password.mjs --local   # this machine's .env.local
 *
 * Production needs the Vercel CLI logged in to the Asala team
 * (`vercel whoami`); the new password works after the next production deploy.
 * --local only rewrites ADMIN_PASSWORD_HASH in .env.local; restart the dev
 * server to pick it up.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";
import bcrypt from "bcryptjs";

const PROJECT = "zandz-plumbing-v3";
const SCOPE = "asala";
const MIN_LENGTH = 12;
const BCRYPT_COST = 12;
const LOCAL_ENV = ".env.local";
const localMode = process.argv.includes("--local");

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Echo nothing while the password is typed.
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  if (!process.stdin.isTTY) {
    console.error("Run this in an interactive terminal so the password can be typed privately.");
    process.exit(1);
  }

  const first = await askHidden(`New admin password (at least ${MIN_LENGTH} characters): `);
  if (first.length < MIN_LENGTH) {
    console.error(`Too short. Use at least ${MIN_LENGTH} characters; a few unrelated words works well.`);
    process.exit(1);
  }
  const second = await askHidden("Type it again: ");
  if (first !== second) {
    console.error("The two entries didn't match. Nothing was changed.");
    process.exit(1);
  }

  const hash = bcrypt.hashSync(first, BCRYPT_COST);

  if (localMode) {
    writeLocalHash(hash);
    return;
  }

  const result = spawnSync(
    "vercel",
    ["env", "add", "ADMIN_PASSWORD_HASH", "production", "--force", "--sensitive", "--project", PROJECT, "--scope", SCOPE],
    { input: hash, stdio: ["pipe", "inherit", "inherit"] }
  );

  if (result.error || result.status !== 0) {
    console.error("\nVercel didn't accept the update. Check `vercel whoami` and try again. Nothing was changed.");
    process.exit(1);
  }

  console.log("\nADMIN_PASSWORD_HASH updated on production.");
  console.log("The new password takes effect on the next production deploy.");
  console.log("Store it in the team password manager now; it can't be recovered, only reset again.");
}

function writeLocalHash(hash) {
  const lines = existsSync(LOCAL_ENV) ? readFileSync(LOCAL_ENV, "utf8").split("\n") : [];
  // Next's env loader expands $NAME, so escape every $ in the bcrypt hash.
  const entry = `ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}`;
  const index = lines.findIndex((line) => line.startsWith("ADMIN_PASSWORD_HASH="));
  if (index >= 0) lines[index] = entry;
  else lines.push(entry);
  writeFileSync(LOCAL_ENV, lines.join("\n"), { mode: 0o600 });
  console.log(`\nADMIN_PASSWORD_HASH updated in ${LOCAL_ENV}. Restart the dev server to use it.`);
}

main();
