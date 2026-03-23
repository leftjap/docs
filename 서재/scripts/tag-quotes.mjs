import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, "..", "quotes-data.json");
const OUTPUT_PATH = resolve(__dirname, "..", "quotes-data-tagged.json");
const PROGRESS_PATH = resolve(__dirname, "..", "quotes-data-progress.json");

// ═══ 태그 체계 ═══

const TOPIC_TAGS = [
  "완벽주의", "비교", "선택", "습관", "루틴", "시작", "실패",
  "성공", "돈", "투자", "소비", "건강", "음식", "운동", "노화",
  "상실", "죽음", "애도", "관계", "사랑", "가족", "육아", "외로움",
  "소통", "공감", "글쓰기", "독서", "창의성", "집중", "몰입",
  "감정", "분노", "두려움", "자존감", "자기수용", "정체성",
  "행복", "고통", "욕망", "겸손", "자유", "도덕", "사회", "정치",
  "일", "리더십", "권력", "교육", "시간", "명상", "중독", "회복탄력성"
];

const TONE_TAGS = ["t:위로", "t:경고", "t:용기", "t:체념", "t:유머", "t:슬픔", "t:분노"];

const FORM_TAGS = ["f:명문", "f:사례", "f:논증", "f:비유"];

const ALL_TAGS_LIST = [...TOPIC_TAGS, ...TONE_TAGS, ...FORM_TAGS].join(", ");

// ═══ Claude API 설정 ═══

const client = new Anthropic();
const MODEL = "claude-sonnet-4-20250514";
const BATCH_SIZE = 10; // 한 번에 처리할 책 수
const DELAY_MS = 1500; // API 호출 간 대기 (ms)

// ═══ 프롬프트 ═══

function buildPrompt(book) {
  const quotesBlock = book.quotes
    .map((q, i) => {
      const text = typeof q === "string" ? q : q.text;
      return `[${i}] ${text}`;
    })
    .join("\n\n");

  return `당신은 독서 어구록(발췌문)에 태그를 부여하는 전문가입니다.

아래는 "${book.book}" (${book.author || "저자 미상"})에서 발췌한 문장들입니다.
각 발췌문에 2~6개의 태그를 부여하세요.

## 태그 규칙

1. **주제(topic)**: 접두어 없음. 반드시 1개 이상.
   사용 가능: ${TOPIC_TAGS.join(", ")}

2. **감정결(tone)**: "t:" 접두어. 0~2개.
   사용 가능: ${TONE_TAGS.join(", ")}

3. **형식(form)**: "f:" 접두어. 0~1개.
   사용 가능: ${FORM_TAGS.join(", ")}

- 목록에 없는 주제 태그가 꼭 필요하면 새로 만들어도 됩니다 (접두어 없이).
- 감정결/형식 태그는 목록 내에서만 선택하세요.
- 태그는 발췌문의 핵심 주제와 톤에 맞게 부여하세요.

## 발췌문

${quotesBlock}

## 출력 형식

반드시 아래 JSON 배열만 출력하세요. 설명이나 마크다운 없이 순수 JSON만.
인덱스 순서를 지키세요.

[
  {"i": 0, "tags": ["태그1", "태그2", "t:감정", "f:형식"]},
  {"i": 1, "tags": ["태그1", "태그2"]},
  ...
]`;
}

// ═══ API 호출 ═══

async function tagOneBook(book) {
  const quoteCount = (book.quotes || []).length;
  if (quoteCount === 0) return [];

  // 이미 태그가 부여된 책인지 확인
  const firstQuote = book.quotes[0];
  if (typeof firstQuote === "object" && firstQuote.tags && firstQuote.tags.length > 0) {
    return null; // 이미 처리됨
  }

  const prompt = buildPrompt(book);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();

  // JSON 파싱 (코드블록 감싸져 있을 수 있음)
  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);
  return parsed;
}

// ═══ 메인 실행 ═══

async function main() {
  // 커맨드 라인 인자: node tag-quotes.mjs [startIdx] [endIdx]
  const args = process.argv.slice(2);
  const startIdx = args[0] !== undefined ? parseInt(args[0], 10) : 0;
  const endIdx = args[1] !== undefined ? parseInt(args[1], 10) : Infinity;

  // 진행 파일이 있으면 이어서, 없으면 원본에서 시작
  let data;
  if (existsSync(PROGRESS_PATH)) {
    console.log("📂 진행 파일 발견 — 이어서 처리합니다.");
    data = JSON.parse(readFileSync(PROGRESS_PATH, "utf-8"));
  } else {
    console.log("📂 원본 파일에서 시작합니다.");
    data = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));
  }

  const totalBooks = data.length;
  const actualEnd = Math.min(endIdx, totalBooks - 1);

  console.log(`\n📚 총 ${totalBooks}권 중 [${startIdx}~${actualEnd}] 처리`);
  console.log(`🏷️  태그 체계: 주제 ${TOPIC_TAGS.length}개 + 감정결 ${TONE_TAGS.length}개 + 형식 ${FORM_TAGS.length}개\n`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalTagged = 0;
  const errors = [];

  for (let i = startIdx; i <= actualEnd; i++) {
    const book = data[i];
    const quoteCount = (book.quotes || []).length;

    process.stdout.write(`[${i}/${actualEnd}] "${book.book}" (${quoteCount}개) ... `);

    try {
      const result = await tagOneBook(book);

      if (result === null) {
        console.log("⏭️  이미 태그됨");
        skipped++;
        continue;
      }

      // 태그 적용
      let taggedCount = 0;
      for (const item of result) {
        const idx = item.i;
        if (idx >= 0 && idx < book.quotes.length) {
          const quote = book.quotes[idx];
          if (typeof quote === "object") {
            quote.tags = item.tags;
            taggedCount++;
          }
        }
      }

      totalTagged += taggedCount;
      processed++;
      console.log(`✅ ${taggedCount}개 태그 부여`);

      // 10권마다 중간 저장
      if (processed % BATCH_SIZE === 0) {
        writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2), "utf-8");
        console.log(`   💾 중간 저장 (${processed}권 처리됨)`);
      }

      // API 속도 제한 방지
      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.log(`❌ 실패: ${err.message}`);
      errors.push({ index: i, book: book.book, error: err.message });
      failed++;

      // 실패해도 중간 저장
      writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2), "utf-8");
      await new Promise((r) => setTimeout(r, 3000)); // 실패 시 더 긴 대기
    }
  }

  // 최종 저장
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2), "utf-8");

  console.log("\n════════════════════════════════════");
  console.log("📊 결과 요약");
  console.log(`   처리: ${processed}권`);
  console.log(`   건너뜀: ${skipped}권 (이미 태그됨)`);
  console.log(`   실패: ${failed}권`);
  console.log(`   태그 부여: ${totalTagged}개 발췌문`);
  console.log(`   출력: ${OUTPUT_PATH}`);
  console.log("════════════════════════════════════\n");

  if (errors.length > 0) {
    console.log("❌ 실패 목록:");
    for (const e of errors) {
      console.log(`   [${e.index}] ${e.book}: ${e.error}`);
    }
    console.log("\n실패한 책은 다시 실행하세요:");
    console.log(`   node tag-quotes.mjs ${errors[0].index} ${errors[errors.length - 1].index}`);
  }
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
