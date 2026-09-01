#!/usr/bin/env node
// 業務秘書の認証情報を作る。
//   npm run work:setup
// 出力された行を .env.local（またはホスティング側の環境変数）に貼り付ける。
// パスワードそのものはどこにも保存されない。

import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { createInterface } from "node:readline";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 32 };
const MAXMEM = 128 * SCRYPT.N * SCRYPT.r * 2;

// readline は stdin につき1つだけ作る。
// 質問のたびに作り直すと、close 後にパイプ入力が読めなくなる。
const isTty = Boolean(process.stdin.isTTY);
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: isTty,
});

let muted = false;
if (isTty) {
  // 入力中はエコーを止める（sudo と同じ挙動）
  rl._writeToOutput = (chunk) => {
    if (!muted) rl.output.write(chunk);
  };
}

// rl.question ではなく行イテレータから1行ずつ取り出す。
// パイプ入力だと全行が一度に流れてくるため、question 方式では2問目以降を取りこぼす。
const lines = rl[Symbol.asyncIterator]();

async function ask(prompt) {
  process.stdout.write(prompt);
  const { value, done } = await lines.next();
  return done ? "" : value;
}

/** 入力中の文字を端末に出さずに1行読む */
async function askHidden(prompt) {
  // パイプ経由（CI や `printf ... | node`）ではマスクする対象がない
  if (!isTty) return ask(prompt);

  process.stdout.write(prompt);
  muted = true;
  const { value, done } = await lines.next();
  muted = false;
  process.stdout.write("\n");
  return done ? "" : value;
}

function fail(message) {
  console.error(`\n${message}`);
  rl.close();
  process.exit(1);
}

async function main() {
  console.log("業務秘書 セットアップ\n");

  const user = (await ask("ユーザー名 [admin]: ")).trim() || "admin";

  const password = await askHidden("パスワード: ");
  if (password.length < 10) {
    fail("パスワードは10文字以上にしてください。");
  }

  const again = await askHidden("もう一度: ");
  if (password !== again) {
    fail("パスワードが一致しません。");
  }

  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: MAXMEM,
  });

  const stored = [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");

  console.log(
    "\n以下を .env.local に貼り付けてください（このファイルはコミットしないこと）:\n",
  );
  console.log(`WORK_USER=${user}`);
  console.log(`WORK_PASSWORD_HASH=${stored}`);
  console.log(`SESSION_SECRET=${randomBytes(32).toString("base64")}`);
  console.log("\nAI秘書を使う場合は、以下も設定してください:");
  console.log("ANTHROPIC_API_KEY=sk-ant-...\n");

  rl.close();
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});
