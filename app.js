const app = document.querySelector("#app");
const homeTemplate = document.querySelector("#homeTemplate");
const practiceTemplate = document.querySelector("#practiceTemplate");
const printReport = document.querySelector("#printReport");
const navToggle = document.querySelector("#navToggle");

const STORAGE_KEY = "math-garden-grade-1-progress-v3";
const TEMP_KEY = "math-garden-grade-1-temp-v3";
const TEMP_MAX_AGE = 2 * 24 * 60 * 60 * 1000;
const QUESTION_COUNT = 50;

const setConfigs = [
  {
    id: 1,
    title: "บวกไม่เกิน 10",
    short: "รวมจำนวนเล็ก ๆ ให้คล่อง",
    detail: "ฝึกการบวกเลขหลักเดียว ผลลัพธ์ไม่เกิน 10 เหมาะสำหรับเริ่มสร้างความมั่นใจเรื่องการรวมจำนวน",
    icon: "+",
    color: "#a6e7ff",
    makeQuestion(index, rng) {
      const a = randomInt(rng, 1, 8);
      const b = randomInt(rng, 1, 10 - a);
      return numericQuestion(`${a} + ${b} = ?`, a + b);
    }
  },
  {
    id: 2,
    title: "ลบไม่เกิน 10",
    short: "หยิบออกแล้วเหลือเท่าไร",
    detail: "ฝึกการลบจากจำนวนไม่เกิน 10 โดยคำตอบไม่ติดลบ เด็กจะได้คุ้นกับการนับถอยหลัง",
    icon: "-",
    color: "#ffcf7a",
    makeQuestion(index, rng) {
      const a = randomInt(rng, 3, 10);
      const b = randomInt(rng, 1, a - 1);
      return numericQuestion(`${a} - ${b} = ?`, a - b);
    }
  },
  {
    id: 3,
    title: "บวกและลบผสม",
    short: "ดูเครื่องหมายให้ดี",
    detail: "สลับโจทย์บวกและลบในช่วงไม่เกิน 10 เพื่อฝึกอ่านเครื่องหมายและเลือกวิธีคิดให้ถูก",
    icon: "±",
    color: "#b9f2c9",
    makeQuestion(index, rng) {
      if (index % 2 === 0) {
        const a = randomInt(rng, 1, 7);
        const b = randomInt(rng, 1, 10 - a);
        return numericQuestion(`${a} + ${b} = ?`, a + b);
      }

      const a = randomInt(rng, 4, 10);
      const b = randomInt(rng, 1, a - 1);
      return numericQuestion(`${a} - ${b} = ?`, a - b);
    }
  },
  {
    id: 4,
    title: "มากกว่า น้อยกว่า เท่ากับ",
    short: "เลือก > < หรือ =",
    detail: "ฝึกเปรียบเทียบจำนวน 1-30 และเลือกเครื่องหมายมากกว่า น้อยกว่า หรือเท่ากับให้ถูกต้อง",
    icon: ">",
    color: "#ffb4c6",
    makeQuestion(index, rng) {
      const a = randomInt(rng, 1, 30);
      const b = index % 7 === 0 ? a : randomInt(rng, 1, 30);
      return choiceQuestion(`${a} ? ${b}`, a > b ? ">" : a < b ? "<" : "=", [">", "<", "="]);
    }
  },
  {
    id: 5,
    title: "เรียงลำดับจำนวน",
    short: "หาตัวเลขที่หายไป",
    detail: "ฝึกมองรูปแบบของจำนวนที่เพิ่มขึ้นทีละ 1, 2, 3 หรือ 5 แล้วเติมจำนวนที่หายไป",
    icon: "1 2",
    color: "#cabfff",
    makeQuestion(index, rng) {
      const step = [1, 2, 3, 5][randomInt(rng, 0, 3)];
      const start = randomInt(rng, 1, 30);
      const missingPosition = randomInt(rng, 0, 4);
      const sequence = [0, 1, 2, 3, 4].map((offset) => start + offset * step);
      const answer = sequence[missingPosition];
      sequence[missingPosition] = "__";
      return numericQuestion(sequence.join(", "), answer);
    }
  },
  {
    id: 6,
    title: "บวกไม่เกิน 20",
    short: "รวมจำนวนที่ใหญ่ขึ้น",
    detail: "ฝึกบวกจำนวนที่ผลลัพธ์ไม่เกิน 20 เพื่อเตรียมพร้อมสำหรับโจทย์สองหลักในชั้น ป.1",
    icon: "20",
    color: "#a6e7ff",
    makeQuestion(index, rng) {
      const a = randomInt(rng, 2, 16);
      const b = randomInt(rng, 1, 20 - a);
      return numericQuestion(`${a} + ${b} = ?`, a + b);
    }
  },
  {
    id: 7,
    title: "ลบไม่เกิน 20",
    short: "ลบแบบไม่ติดลบ",
    detail: "ฝึกลบจากจำนวน 10-20 โดยคำตอบเป็นจำนวนบวก ช่วยให้เด็กเข้าใจการลดจำนวนทีละขั้น",
    icon: "18",
    color: "#ffcf7a",
    makeQuestion(index, rng) {
      const a = randomInt(rng, 10, 20);
      const b = randomInt(rng, 1, a - 1);
      return numericQuestion(`${a} - ${b} = ?`, a - b);
    }
  },
  {
    id: 8,
    title: "หลักสิบ หลักหน่วย",
    short: "อ่านจำนวนสองหลัก",
    detail: "ฝึกแยกหลักสิบและหลักหน่วยของจำนวน 10-99 เพื่อให้เข้าใจค่าประจำหลัก",
    icon: "10",
    color: "#b9f2c9",
    makeQuestion(index, rng) {
      const number = randomInt(rng, 10, 99);
      const askTens = rng() > 0.5;
      return numericQuestion(
        `${number} มี${askTens ? "หลักสิบ" : "หลักหน่วย"}เป็นเลขอะไร`,
        askTens ? Math.floor(number / 10) : number % 10
      );
    }
  },
  {
    id: 9,
    title: "รูปทรง เงิน และเวลา",
    short: "โจทย์ใกล้ตัว",
    detail: "ฝึกโจทย์ชีวิตประจำวัน เช่น เงินบาท เวลา และชื่อรูปทรงพื้นฐาน ผ่านคำถามสั้น ๆ",
    icon: "฿",
    color: "#ffb4c6",
    makeQuestion(index, rng) {
      const type = index % 3;
      if (type === 0) {
        const a = randomInt(rng, 1, 15);
        const b = randomInt(rng, 1, 10);
        return numericQuestion(`มีเงิน ${a} บาท ได้เพิ่ม ${b} บาท รวมเป็นกี่บาท`, a + b);
      }

      if (type === 1) {
        const hour = randomInt(rng, 1, 11);
        const later = randomInt(rng, 1, 4);
        return numericQuestion(`ตอนนี้ ${hour} โมง อีก ${later} ชั่วโมงเป็นกี่โมง`, ((hour + later - 1) % 12) + 1);
      }

      const shapes = [
        ["มี 3 ด้าน คือรูปอะไร", "สามเหลี่ยม"],
        ["มี 4 ด้านเท่ากัน คือรูปอะไร", "สี่เหลี่ยมจัตุรัส"],
        ["กลม ไม่มีมุม คือรูปอะไร", "วงกลม"]
      ];
      const selected = shapes[randomInt(rng, 0, shapes.length - 1)];
      return choiceQuestion(selected[0], selected[1], ["สามเหลี่ยม", "สี่เหลี่ยมจัตุรัส", "วงกลม"]);
    }
  },
  {
    id: 10,
    title: "โจทย์รวมทบทวน",
    short: "รวมทุกเรื่องในชุดเดียว",
    detail: "ทบทวนบวก ลบ เปรียบเทียบ ลำดับจำนวน หลักหน่วย และโจทย์สั้น ๆ รวมกัน 50 ข้อ",
    icon: "50",
    color: "#cabfff",
    makeQuestion(index, rng) {
      const type = index % 5;
      if (type === 0) {
        const a = randomInt(rng, 2, 12);
        const b = randomInt(rng, 1, 8);
        return numericQuestion(`มีส้ม ${a} ผล ซื้อเพิ่ม ${b} ผล รวมกี่ผล`, a + b);
      }

      if (type === 1) {
        const a = randomInt(rng, 7, 20);
        const b = randomInt(rng, 1, a - 1);
        return numericQuestion(`มีขนม ${a} ชิ้น กินไป ${b} ชิ้น เหลือกี่ชิ้น`, a - b);
      }

      if (type === 2) {
        const a = randomInt(rng, 1, 30);
        const b = randomInt(rng, 1, 30);
        return choiceQuestion(`${a} ? ${b}`, a > b ? ">" : a < b ? "<" : "=", [">", "<", "="]);
      }

      if (type === 3) {
        const start = randomInt(rng, 1, 20);
        const step = randomInt(rng, 1, 3);
        return numericQuestion(`${start}, ${start + step}, __, ${start + step * 3}`, start + step * 2);
      }

      const number = randomInt(rng, 10, 99);
      return numericQuestion(`${number} มีหลักหน่วยเป็นเลขอะไร`, number % 10);
    }
  }
];

let currentSetId = 1;
let questions = [];
let autoSaveTimer = null;
let storageWritable = true;
const memoryRecords = {};
let controlBandResizeObserver = null;

function numericQuestion(text, answer) {
  return { text, answer: String(answer), inputMode: "numeric" };
}

function choiceQuestion(text, answer, choices) {
  return { text, answer: String(answer), choices };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function createSeed() {
  return Math.floor(Date.now() + Math.random() * 1000000);
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function readJson(key) {
  if (!storageWritable && Object.prototype.hasOwnProperty.call(memoryRecords, key)) {
    return memoryRecords[key];
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return memoryRecords[key] || null;
    }
    const parsed = JSON.parse(item);
    memoryRecords[key] = parsed;
    return parsed;
  } catch {
    storageWritable = false;
    return memoryRecords[key] || null;
  }
}

function writeJson(key, value) {
  memoryRecords[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    storageWritable = true;
    return true;
  } catch {
    storageWritable = false;
    return false;
  }
}

function removeJson(key) {
  delete memoryRecords[key];
  try {
    localStorage.removeItem(key);
  } catch {
    storageWritable = false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unpackProgress(record) {
  return record?.sets || record || {};
}

function getRecordTime(record) {
  return Number(record?.updatedAt || 0);
}

function cleanupExpiredTemp() {
  const temp = readJson(TEMP_KEY);
  if (temp?.updatedAt && Date.now() - temp.updatedAt > TEMP_MAX_AGE) {
    removeJson(TEMP_KEY);
  }
}

function loadProgress() {
  cleanupExpiredTemp();
  const savedRecord = readJson(STORAGE_KEY);
  const tempRecord = readJson(TEMP_KEY);

  if (tempRecord?.sets && getRecordTime(tempRecord) >= getRecordTime(savedRecord)) {
    return unpackProgress(tempRecord);
  }

  return unpackProgress(savedRecord);
}

function saveProgress(progress) {
  return writeJson(STORAGE_KEY, { updatedAt: Date.now(), sets: progress });
}

function saveTemp(progress = loadProgress()) {
  const saved = writeJson(TEMP_KEY, { updatedAt: Date.now(), sets: progress });
  updateSaveStatus(saved && storageWritable ? "บันทึกล่าสุดแล้ว" : "บันทึกถาวรไม่ได้ ใช้ข้อมูลชั่วคราวในหน่วยความจำ");
}

function setPracticeChromeActive(active) {
  document.body.classList.toggle("practice-active", active);
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  if (controlBandResizeObserver) {
    controlBandResizeObserver.disconnect();
    controlBandResizeObserver = null;
  }

  if (!active) {
    document.documentElement.style.removeProperty("--control-band-space");
    return;
  }

  const controlBand = document.querySelector(".control-band");
  if (!controlBand) {
    return;
  }

  const updateControlBandSpace = () => {
    const height = Math.ceil(controlBand.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--control-band-space", `${height + 28}px`);
  };

  updateControlBandSpace();
  if ("ResizeObserver" in window) {
    controlBandResizeObserver = new ResizeObserver(updateControlBandSpace);
    controlBandResizeObserver.observe(controlBand);
  }
}

function getSetProgress(setId) {
  const progress = loadProgress();
  const setProgress = progress[setId] || {};
  return {
    seed: setProgress.seed || createSeed(),
    answers: setProgress.answers || {},
    checked: setProgress.checked || {},
    exported: Boolean(setProgress.exported),
    exportedAt: setProgress.exportedAt || null
  };
}

function updateSetProgress(setId, nextSetProgress) {
  const progress = loadProgress();
  progress[setId] = {
    ...nextSetProgress,
    updatedAt: Date.now()
  };
  saveProgress(progress);
  saveTemp(progress);
}

function ensureSetSeed(config) {
  const setProgress = getSetProgress(config.id);
  updateSetProgress(config.id, setProgress);
  return setProgress.seed;
}

function buildQuestions(config, seed) {
  const rng = seededRandom(seed + config.id * 1009);
  return Array.from({ length: QUESTION_COUNT }, (_, index) => ({
    number: index + 1,
    ...config.makeQuestion(index, rng)
  }));
}

function normalizeAnswer(value) {
  return String(value).trim().replace(/\s+/g, "");
}

function isCorrect(question, value) {
  return normalizeAnswer(value) === normalizeAnswer(question.answer);
}

function getCompletion(config, setProgress = getSetProgress(config.id)) {
  const builtQuestions = buildQuestions(config, setProgress.seed);
  const answered = builtQuestions.filter((_, index) => Boolean(setProgress.answers[String(index)])).length;
  const checked = builtQuestions.filter((_, index) => Boolean(setProgress.checked[String(index)])).length;
  const correct = builtQuestions.filter((question, index) => {
    const key = String(index);
    return setProgress.checked[key] && isCorrect(question, setProgress.answers[key]);
  }).length;
  return {
    answered,
    checked,
    correct,
    wrong: checked - correct,
    complete: answered === QUESTION_COUNT && checked === QUESTION_COUNT
  };
}

function renderHome() {
  app.replaceChildren(homeTemplate.content.cloneNode(true));
  setPracticeChromeActive(false);

  const setGrid = document.querySelector("#practice-list");
  const progress = loadProgress();
  let totalDone = 0;
  let totalCorrect = 0;
  let bestSet = "-";
  let bestScore = -1;

  setConfigs.forEach((config) => {
    const setProgress = progress[config.id]
      ? { ...getSetProgress(config.id), ...progress[config.id] }
      : getSetProgress(config.id);
    const completion = getCompletion(config, setProgress);
    totalDone += completion.answered;
    totalCorrect += completion.correct;

    if (completion.correct > bestScore) {
      bestScore = completion.correct;
      bestSet = completion.correct > 0 ? `ชุด ${config.id}` : "-";
    }

    const card = document.createElement("a");
    card.className = "set-card";
    card.href = `#set-${config.id}`;
    card.innerHTML = `
      <div>
        <span class="set-icon" style="background:${config.color}">${config.icon}</span>
        <p class="eyebrow">ชุดที่ ${config.id}</p>
        <h2>${config.title}</h2>
        <p>${config.detail}</p>
      </div>
      <div>
        <p>${completion.correct}/50 ถูก · ทำแล้ว ${completion.answered}/50</p>
        <div class="mini-progress" aria-hidden="true">
          <span style="width:${(completion.answered / QUESTION_COUNT) * 100}%"></span>
        </div>
      </div>
    `;
    setGrid.append(card);
  });

  document.querySelector("#totalDone").textContent = String(totalDone);
  document.querySelector("#totalCorrect").textContent = String(totalCorrect);
  document.querySelector("#bestSet").textContent = bestSet;
}

function renderPractice(setId) {
  const config = setConfigs.find((item) => item.id === setId) || setConfigs[0];
  currentSetId = config.id;
  const seed = ensureSetSeed(config);
  questions = buildQuestions(config, seed);
  app.replaceChildren(practiceTemplate.content.cloneNode(true));
  setPracticeChromeActive(true);

  document.querySelector("#practiceEyebrow").textContent = `ชุดที่ ${config.id} จาก 10`;
  document.querySelector("#practiceTitle").textContent = config.title;
  document.querySelector("#practiceDescription").textContent = config.detail;

  const previous = document.querySelector("#prevSet");
  const next = document.querySelector("#nextSet");
  previous.href = config.id === 1 ? "#home" : `#set-${config.id - 1}`;
  previous.textContent = config.id === 1 ? "หน้าแรก" : `ชุด ${config.id - 1}`;
  next.href = config.id === 10 ? "#home" : `#set-${config.id + 1}`;
  next.textContent = config.id === 10 ? "กลับหน้าแรก" : `ชุด ${config.id + 1}`;

  renderQuestions(config);
  refreshPracticeStats(config);
  updateSaveStatus("พร้อมบันทึกอัตโนมัติ");

  document.querySelector("#saveNow").addEventListener("click", () => saveTemp(loadProgress()));
  document.querySelector("#checkAll").addEventListener("click", () => checkAllAnswers(config));
  document.querySelector("#exportPdf").addEventListener("click", () => exportCurrentSet(config));
  document.querySelector("#randomReset").addEventListener("click", () => resetWithNewQuestions(config));
  document.querySelector("#resetSet").addEventListener("click", () => resetCurrentSet(config));
}

function renderQuestions(config) {
  const grid = document.querySelector("#questionGrid");
  const setProgress = getSetProgress(config.id);
  grid.replaceChildren();

  questions.forEach((question, index) => {
    const key = String(index);
    const value = setProgress.answers[key] || "";
    const checked = Boolean(setProgress.checked[key]);
    const card = document.createElement("article");
    card.className = "question-card";
    card.dataset.index = key;
    if (checked) {
      card.classList.add(isCorrect(question, value) ? "correct" : "wrong");
    }

    const top = document.createElement("div");
    top.className = "question-top";
    top.innerHTML = `
      <span class="question-number">${question.number}</span>
      <p class="question-text">${question.text}</p>
    `;

    const row = document.createElement("div");
    row.className = "answer-row";
    if (question.choices) {
      question.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.className = "choice";
        button.type = "button";
        button.textContent = choice;
        button.setAttribute("aria-pressed", String(value === choice));
        button.classList.toggle("selected", value === choice);
        button.addEventListener("click", () => setAnswer(config, index, choice));
        row.append(button);
      });
    } else {
      const input = document.createElement("input");
      input.className = "answer-input";
      input.type = "text";
      input.inputMode = question.inputMode || "text";
      input.pattern = question.inputMode === "numeric" ? "[0-9]*" : "";
      input.value = value;
      input.setAttribute("aria-label", `คำตอบข้อ ${question.number}`);
      input.addEventListener("input", () => setAnswer(config, index, input.value));
      row.append(input);
    }

    const result = document.createElement("p");
    result.className = "result";
    result.textContent = checked ? getResultText(question, value) : "";

    card.append(top, row, result);
    grid.append(card);
  });
}

function setAnswer(config, index, value) {
  const setProgress = getSetProgress(config.id);
  const key = String(index);
  setProgress.answers[key] = value;
  delete setProgress.checked[key];
  updateSetProgress(config.id, setProgress);
  updateCardState(config, index);
  refreshPracticeStats(config);
}

function updateCardState(config, index) {
  const setProgress = getSetProgress(config.id);
  const question = questions[index];
  const key = String(index);
  const card = document.querySelector(`.question-card[data-index="${key}"]`);
  if (!card) {
    return;
  }

  const value = setProgress.answers[key] || "";
  const checked = Boolean(setProgress.checked[key]);
  card.classList.toggle("correct", checked && isCorrect(question, value));
  card.classList.toggle("wrong", checked && !isCorrect(question, value));
  card.querySelector(".result").textContent = checked ? getResultText(question, value) : "";

  card.querySelectorAll(".choice").forEach((button) => {
    const selected = button.textContent === value;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function getResultText(question, value) {
  return isCorrect(question, value) ? "ถูกต้อง" : `ผิด คำตอบที่ถูกคือ ${question.answer}`;
}

function checkAllAnswers(config) {
  const setProgress = getSetProgress(config.id);
  questions.forEach((_, index) => {
    const key = String(index);
    if (setProgress.answers[key] !== undefined && setProgress.answers[key] !== "") {
      setProgress.checked[key] = true;
    }
  });
  updateSetProgress(config.id, setProgress);
  renderQuestions(config);
  refreshPracticeStats(config);
}

function resetCurrentSet(config) {
  const setProgress = getSetProgress(config.id);
  updateSetProgress(config.id, {
    seed: setProgress.seed,
    answers: {},
    checked: {},
    exported: false,
    exportedAt: null
  });
  renderQuestions(config);
  refreshPracticeStats(config);
}

function resetWithNewQuestions(config) {
  const setProgress = getSetProgress(config.id);
  const completion = getCompletion(config, setProgress);
  if (!completion.complete || !setProgress.exported) {
    updateSaveStatus("สุ่มโจทย์ใหม่ได้หลังทำครบและ Export PDF แล้ว");
    return;
  }

  updateSetProgress(config.id, {
    seed: createSeed(),
    answers: {},
    checked: {},
    exported: false,
    exportedAt: null
  });
  questions = buildQuestions(config, getSetProgress(config.id).seed);
  renderQuestions(config);
  refreshPracticeStats(config);
  updateSaveStatus("สุ่มโจทย์ชุดใหม่เรียบร้อย");
}

function refreshPracticeStats(config) {
  const setProgress = getSetProgress(config.id);
  const completion = getCompletion(config, setProgress);
  document.querySelector("#scoreText").textContent = `${completion.correct}/50`;
  document.querySelector("#progressText").textContent = `${completion.answered} จาก 50 ข้อ`;
  document.querySelector("#progressBar").style.width = `${(completion.answered / QUESTION_COUNT) * 100}%`;
  renderSummary(config, setProgress, completion);
  updateActionStates(setProgress, completion);
}

function updateActionStates(setProgress, completion) {
  const exportButton = document.querySelector("#exportPdf");
  const randomReset = document.querySelector("#randomReset");
  if (!exportButton || !randomReset) {
    return;
  }

  exportButton.disabled = !completion.complete;
  randomReset.disabled = !completion.complete || !setProgress.exported;
  randomReset.title = randomReset.disabled ? "ทำให้ครบและ Export PDF ก่อน" : "สุ่มโจทย์ใหม่";
}

function renderSummary(config, setProgress, completion) {
  const summary = document.querySelector("#setSummary");
  if (!summary) {
    return;
  }

  const wrongRows = questions
    .map((question, index) => {
      const value = setProgress.answers[String(index)] || "";
      const checked = Boolean(setProgress.checked[String(index)]);
      const correct = checked && isCorrect(question, value);
      return { question, value, checked, correct };
    })
    .filter((item) => item.checked && !item.correct);

  if (!completion.complete) {
    summary.innerHTML = `
      <div>
        <p class="eyebrow">สรุประหว่างทำ</p>
        <h2>${config.title}</h2>
        <p>${config.detail}</p>
      </div>
      <div class="summary-numbers">
        <span>ทำแล้ว <strong>${completion.answered}/50</strong></span>
        <span>ตรวจแล้ว <strong>${completion.checked}/50</strong></span>
        <span>ถูก <strong>${completion.correct}</strong></span>
      </div>
      <p class="summary-note">ตอบให้ครบ 50 ข้อ แล้วกดตรวจคำตอบเพื่อดูสรุปเต็มและ Export PDF</p>
    `;
    return;
  }

  summary.innerHTML = `
    <div>
      <p class="eyebrow">สรุปผลชุดนี้</p>
      <h2>${config.title}</h2>
      <p>${config.detail}</p>
    </div>
    <div class="summary-numbers">
      <span>ถูก <strong>${completion.correct}</strong></span>
      <span>ผิด <strong>${completion.wrong}</strong></span>
      <span>คะแนน <strong>${completion.correct}/50</strong></span>
    </div>
    ${setProgress.exported ? `<p class="summary-note success">Export PDF แล้ว สามารถสุ่มโจทย์ใหม่ได้</p>` : `<p class="summary-note">กด Export PDF เพื่อเก็บผลชุดนี้</p>`}
    ${wrongRows.length ? renderWrongList(wrongRows) : `<p class="all-correct">เยี่ยมมาก ถูกทุกข้อ</p>`}
  `;
}

function renderWrongList(wrongRows) {
  return `
    <div class="wrong-list">
      <h3>ข้อที่ผิดและคำตอบที่ถูก</h3>
      ${wrongRows.map(({ question, value }) => `
        <div>
          <span>ข้อ ${escapeHtml(question.number)}</span>
          <p>${escapeHtml(question.text)}</p>
          <p>ตอบ: ${escapeHtml(value || "-")} · คำตอบที่ถูก: <strong>${escapeHtml(question.answer)}</strong></p>
        </div>
      `).join("")}
    </div>
  `;
}

function buildPrintableReport(config) {
  const setProgress = getSetProgress(config.id);
  const completion = getCompletion(config, setProgress);
  const rows = questions.map((question, index) => {
    const value = setProgress.answers[String(index)] || "";
    const correct = isCorrect(question, value);
    return `
      <tr>
        <td>${escapeHtml(question.number)}</td>
        <td>${escapeHtml(question.text)}</td>
        <td>${escapeHtml(value || "-")}</td>
        <td>${escapeHtml(question.answer)}</td>
        <td>${correct ? "ถูก" : "ผิด"}</td>
      </tr>
    `;
  }).join("");

  printReport.innerHTML = `
    <h1>รายงานผลแบบฝึกคณิตศาสตร์ ป.1</h1>
    <p>ชุดที่ ${escapeHtml(config.id)}: ${escapeHtml(config.title)}</p>
    <p>${escapeHtml(config.detail)}</p>
    <p>คะแนน ${escapeHtml(completion.correct)}/${QUESTION_COUNT} · ผิด ${escapeHtml(completion.wrong)} ข้อ · วันที่ ${escapeHtml(new Date().toLocaleString("th-TH"))}</p>
    <table>
      <thead>
        <tr>
          <th>ข้อ</th>
          <th>โจทย์</th>
          <th>คำตอบที่ทำ</th>
          <th>คำตอบที่ถูก</th>
          <th>ผล</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function markExportedAfterConfirmation(config) {
  if (!window.confirm("บันทึกหรือพิมพ์ PDF เรียบร้อยแล้วใช่ไหม")) {
    updateSaveStatus("ยังไม่บันทึกสถานะ Export PDF");
    return;
  }

  const setProgress = getSetProgress(config.id);
  updateSetProgress(config.id, {
    ...setProgress,
    exported: true,
    exportedAt: Date.now()
  });
  refreshPracticeStats(config);
  updateSaveStatus("บันทึกสถานะ Export PDF แล้ว");
}

function printThenConfirmExport(config) {
  let handled = false;
  const handlePrintClosed = () => {
    if (handled) {
      return;
    }
    handled = true;
    window.removeEventListener("afterprint", handlePrintClosed);
    markExportedAfterConfirmation(config);
  };

  window.addEventListener("afterprint", handlePrintClosed, { once: true });
  window.print();
}

function exportCurrentSet(config) {
  const setProgress = getSetProgress(config.id);
  const completion = getCompletion(config, setProgress);
  if (!completion.complete) {
    updateSaveStatus("ตอบและตรวจให้ครบ 50 ข้อก่อน Export PDF");
    return;
  }

  buildPrintableReport(config);
  updateSaveStatus("กำลังเปิดหน้าต่างพิมพ์ PDF");
  printThenConfirmExport(config);
}

function updateSaveStatus(message) {
  const saveStatus = document.querySelector("#saveStatus");
  if (!saveStatus) {
    return;
  }

  const temp = readJson(TEMP_KEY);
  const time = temp?.updatedAt ? new Date(temp.updatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";
  saveStatus.textContent = `${message} · temp ล่าสุด ${time} · temp จะหมดอายุใน 2 วัน`;
}

function startAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }
  autoSaveTimer = setInterval(() => saveTemp(loadProgress()), 30000);
}

function updateActiveNav(hash) {
  const activeHash = hash.match(/^#set-\d+$/) ? hash : "#home";
  document.querySelectorAll(".quick-nav a").forEach((link) => {
    const isActive = link.getAttribute("href") === activeHash;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function toggleMobileNav() {
  const opened = document.body.classList.toggle("nav-open");
  navToggle?.setAttribute("aria-expanded", String(opened));
}

function closeMobileNav() {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function route() {
  cleanupExpiredTemp();
  const hash = window.location.hash || "#home";
  updateActiveNav(hash);
  const match = hash.match(/^#set-(\d+)$/);
  if (match) {
    renderPractice(Number(match[1]));
    return;
  }
  renderHome();
}

window.addEventListener("hashchange", route);
window.addEventListener("beforeunload", () => saveTemp(loadProgress()));
navToggle?.addEventListener("click", toggleMobileNav);
document.querySelectorAll(".quick-nav a").forEach((link) => link.addEventListener("click", closeMobileNav));
startAutoSave();
route();
