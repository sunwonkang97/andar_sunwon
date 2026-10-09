// config.js의 시간표·사이즈·최대 세션 수를 Code.gs의 생성 블록에 반영한다.
//   node gas/sync.js          → Code.gs 갱신
//   node gas/sync.js --check  → 어긋나 있으면 종료 코드 1 (배포 전 확인용)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const gasPath = path.join(__dirname, "Code.gs");
const START = "// ---- config.js에서 생성됨";
const END = "// ---- 생성 끝 ----";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), sandbox);
const C = sandbox.window.APP_CONFIG;

const src = fs.readFileSync(gasPath, "utf8");
const eol = src.includes("\r\n") ? "\r\n" : "\n"; // Code.gs의 줄바꿈 방식을 유지

const j = (v) => JSON.stringify(v);
const block = [
  `${START}: 직접 수정하지 말고 config.js 수정 후 \`node gas/sync.js\` 실행 ----`,
  `var MAX_SESSIONS = ${j(C.MAX_SESSIONS)};`,
  `var DATES = ${j(C.DATES)};`,
  "var SCHEDULE = [",
  C.SCHEDULE.map((r) => `  ${j({ time: r.time, sessions: r.sessions })}`).join("," + eol),
  "];",
  "var SIZES = {",
  Object.entries(C.SIZES).map(([k, v]) => `  ${k}: ${j(v)}`).join("," + eol),
  "};",
  END,
].join(eol);

const s = src.indexOf(START);
const e = src.indexOf(END);
if (s < 0 || e < 0) {
  console.error("Code.gs에서 생성 블록 표시를 찾지 못했습니다.");
  process.exit(1);
}
const next = src.slice(0, s) + block + src.slice(e + END.length);

if (process.argv.includes("--check")) {
  if (next !== src) {
    console.error("Code.gs가 config.js와 다릅니다. `node gas/sync.js`를 실행하세요.");
    process.exit(1);
  }
  console.log("Code.gs가 config.js와 일치합니다.");
} else if (next === src) {
  console.log("변경 없음.");
} else {
  fs.writeFileSync(gasPath, next);
  console.log("Code.gs 갱신 완료 — Apps Script에 붙여넣고 새 버전으로 재배포하세요.");
}
