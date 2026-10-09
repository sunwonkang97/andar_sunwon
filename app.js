(function () {
  const C = window.APP_CONFIG;
  const app = document.getElementById("app");

  // 페이지 이동 간에 유지되는 입력 상태
  const state = { selected: [], form: {}, submitting: false, error: "", lastChosen: [], step: 1 };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sessionId = (date, time, name) => `${date} ${time} ${name}`;
  const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dow = (d) => { const [m, day] = d.split("/").map(Number); return DOW_NAMES[new Date(C.YEAR, m - 1, day).getDay()]; };

  const ICON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    check: '<svg viewBox="0 0 12 12" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.4l2.6 2.6L10 3.4"/></svg>',
    chevron: '<svg viewBox="0 0 14 9" fill="none"><path d="M1 1.5l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const mesh = () => '<div class="mesh kv"><img src="assets/keyvisual.jpg" alt="" /></div><div class="grain"></div>';

  // ---------- pages ----------
  // 1P: 링크로 처음 들어왔을 때 잠깐 보였다가 서서히 사라지는 인트로 (아래에 2P가 미리 그려져 있음)
  function Splash() {
    return `
      <section class="hero view">
        ${mesh()}
        <div class="bar"><span></span><span></span></div>
        <div class="mark">
          <h1 class="word"><img src="assets/logo.png" alt="andar" /></h1>
          <div class="sub">ANDAR. IN MOTION</div>
        </div>
        <div class="foot">
          <div class="when">
            <p>${esc(C.EVENT.period)}</p>
          </div>
        </div>
      </section>`;
  }
  const SPLASH_MS = 900; // 인트로 최소 표시 시간 (이후 서서히 사라짐, 탭하면 바로 넘어감)
  function showSplash() {
    const el = document.createElement("div");
    el.className = "splash";
    el.innerHTML = Splash();
    document.body.appendChild(el);
    document.documentElement.classList.add("splash-on");
    const shownAt = Date.now();
    let ready = false, skip = false, gone = false;
    const hide = () => {
      if (gone) return;
      gone = true;
      el.classList.add("out");
      document.documentElement.classList.remove("splash-on");
      setTimeout(() => el.remove(), 700);
    };
    el.addEventListener("click", () => { skip = true; if (ready) hide(); });
    // 아래 페이지가 준비되면 호출: 최소 표시 시간을 채운 뒤 사라진다
    return () => { ready = true; if (skip) hide(); else setTimeout(hide, Math.max(0, SPLASH_MS - (Date.now() - shownAt))); };
  }

  function tiles() {
    const full = state.selected.length >= C.MAX_SESSIONS;
    const days = `<div class="days"><span></span>${C.DATES.map((d) => `<div class="day"><b>${d.replace("/", ".")}</b><span>${dow(d)}</span></div>`).join("")}</div>`;
    const rows = C.SCHEDULE.map((row) => {
      const cells = row.sessions.map((name, i) => {
        const id = sessionId(C.DATES[i], row.time, name);
        const on = state.selected.includes(id);
        return `<button type="button" class="tile ${on ? "on" : full ? "dim" : ""}" data-session="${esc(id)}" aria-pressed="${on}"><span class="chk">${ICON.check}</span><span>${esc(name)}</span></button>`;
      }).join("");
      return `<div class="slot"><div class="time">${row.time}<small>~ ${row.end}</small></div>${cells}</div>`;
    }).join("");
    return days + `<div class="slots">${rows}</div>`;
  }

  function selectField(name, label, options, aux) {
    const val = state.form[name] || "";
    const head = aux ? `<div class="f-h"><label>${label}</label>${aux}</div>` : `<label>${label}</label>`;
    const opts = options.map((o) => `<button type="button" class="dd-opt ${val === o ? "on" : ""}" data-value="${esc(o)}" role="option" aria-selected="${val === o}">${esc(o)}</button>`).join("");
    return `<div class="f" data-field="${name}">${head}
      <div class="dd">
        <button type="button" class="in dd-btn ${val ? "" : "empty"}" aria-haspopup="listbox" aria-expanded="false"><span class="dd-label">${val ? esc(val) : "선택"}</span><span class="dd-arrow">${ICON.chevron}</span></button>
        <div class="dd-list" role="listbox">${opts}</div>
      </div>
    </div>`;
  }
  function inputField(name, label, attrs) {
    return `<div class="f" data-field="${name}"><label>${label}</label><input class="in" name="${name}" value="${esc(state.form[name] || "")}" ${attrs || ""} /></div>`;
  }

  function genderField() {
    const g = state.form.gender || "";
    return `<div class="f gender" data-field="gender"><label>성별</label>
      <div class="gender-row">${["남", "여"].map((v) => `<button type="button" class="g-btn ${g === v ? "on" : ""}" data-gender="${v}" aria-pressed="${g === v}">${v}</button>`).join("")}</div></div>`;
  }

  const hasRun = () => state.selected.some((id) => id.endsWith("STRETCH YOUR RUN"));
  function docBlock(title, key) {
    const d = C.CONSENT_DOCS[key];
    return `<div class="cons doc-blk"><div class="cons-h"><b>${title}</b></div><div class="doc-scroll">${esc(d.text).replace(/\n/g, "<br />")}</div></div>`;
  }
  function mktField() {
    const btn = (v, t) => `<button type="button" class="g-btn c-btn ${state.mkt === v ? "on" : ""}" data-mkt="${v}" aria-pressed="${state.mkt === v}">${t}</button>`;
    return `<div class="cons" data-field="agreeMkt">
      <div class="cons-h"><b>마케팅 활용동의</b></div>
      <button type="button" class="doc-box" data-doc="marketing">내용 보기</button>
      <div class="choice-row">${btn("Y", "네, 동의합니다")}${btn("N", "아니요, 동의하지 않습니다")}</div>
    </div>`;
  }
  function step2Body() {
    const female = state.form.gender === "여";
    const S = female ? C.SIZES.female : C.SIZES.male;
    const run = hasRun();
    const shoes = run ? selectField("shoes", "운동화 사이즈", C.SIZES.shoes, '<span class="note">STRETCH YOUR RUN 참가자 전용</span>') : "";
    return `
          <form id="form" novalidate>
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />
            <section class="sec">
              <div class="sec-h"><span class="no">03</span><h2>Gift</h2><span class="aux">${female ? "여성" : "남성"}</span></div>
              <div class="form">
                ${selectField("top", "상의", S.top)}
                ${female ? selectField("bra", "브라탑", S.bra) : ""}
                ${selectField("bottom", "하의", S.bottom)}
                ${shoes}
              </div>
            </section>
            <section class="sec cons-sec">
              ${mktField()}
              ${docBlock("개인정보 처리업무 위탁안내", "third")}
              ${docBlock("유의 사항 확인", "notice")}
            </section>
          </form>`;
  }

  function Apply() {
    const step1 = state.step === 1;
    const head = `<div class="top"><button class="back" data-${step1 ? "go" : "step"}="${step1 ? "/sessions" : "1"}" aria-label="뒤로">${ICON.back}</button><div class="ttl">안다르 인모션 클래스</div><span class="top-sp"></span></div>`;
    const honeypot = '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />';
    const body = step1 ? `
          <div class="notice">
            <b>* 클래스 신청 시 유의사항 *</b>
            클래스는 1인당 최대 ${C.MAX_SESSIONS}개까지 신청 가능하며<br />
            최종 참가자는 ${esc(C.ANNOUNCE_DATE)} 개별 문자 발송드릴 예정입니다.
          </div>
          <section class="sec">
            <div class="sec-h"><span class="no">01</span><h2>Class</h2><span class="aux" id="count"></span></div>
            <div id="tiles">${tiles()}</div>
          </section>
          <form id="form" novalidate>
            ${honeypot}
            <section class="sec">
              <div class="sec-h"><span class="no">02</span><h2>Information</h2></div>
              <div class="form">
                ${inputField("name", "성함", 'autocomplete="name" placeholder="홍길동"')}
                ${genderField()}
                ${inputField("phone", "연락처", 'type="tel" inputmode="numeric" placeholder="010-0000-0000" autocomplete="tel"')}
                ${inputField("andarId", "안다르 아이디", 'autocapitalize="off" autocomplete="off" placeholder="andar_id"')}
                ${inputField("instaId", "인스타 아이디 <em>(선택)</em>", 'autocapitalize="off" autocomplete="off" placeholder="@instagram_id"')}
              </div>
            </section>
          </form>` : step2Body();
    const action = step1
      ? `<button class="submit next ready" id="next" type="button"><span>NEXT</span></button>`
      : '<button class="submit" id="submit" type="submit" form="form"></button>';
    return `
      <div class="split view">
      <div class="page main">
        ${head}
        <div class="wrap">${body}
        </div>
        <div class="dock"><p class="msg" id="err">${esc(state.error)}</p>${action}</div>
      </div>
      </div>`;
  }

  function art(item, no) {
    const num = no ? `<span class="no">${String(no).padStart(2, "0")}</span>` : "";
    return `<div class="art">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" decoding="async" />` : ""}${num}</div>`;
  }

  function Sessions() {
    let n = 0;
    const days = C.MAIN_MOTION.map((d) => `
      <div class="day-col"><div class="day-tag">${esc(d.day)}</div>
        <div class="cards">${d.classes.map((m) => `
          <div class="card">${art(m, ++n)}<div class="body"><b class="time">${esc(m.time)}</b><p>${esc(m.text)}</p></div></div>`).join("")}
        </div></div>`).join("");
    const wide = (r, no) => `
      <div class="card">${art(r, no)}<div class="body"><span class="tag">${esc(r.subtitle)}</span><b class="time">${esc(r.time)}</b><p>${esc(r.text)}</p></div></div>`;
    return `
      <div class="page sessions-page view">
        <div class="wrap">
          <header class="intro">
            <h1 class="intro-logo"><img src="assets/popup-logo.png" alt="ANDAR. IN MOTION" /></h1>
            <p class="when"><span class="w-date">${esc(C.EVENT.periodShort)}</span><span class="w-place">${esc(C.EVENT.address)}</span></p>
            <i class="rule"></i>
            <p class="lead2">${C.INTRO.lead.map((l) => `<span>${esc(l)}</span>`).join("")}</p>
            <p class="lead3">${C.INTRO.sub.map((l) => `<span>${esc(l).replace("ambassador", "<em>ambassador</em>")}</span>`).join("")}</p>
          </header>
          <section class="class-panel">${days}</section>
          <section class="class-panel specials"><div class="day-col"><div class="day-tag">${esc(C.SPECIAL_DATE)}</div><div class="cards">${wide(C.STRETCH_YOUR_RUN, 1)}${wide(C.K_SOUND_BATH, 2)}</div></div></section>
        </div>
        <div class="wrap end"><div class="deadline">
            <span class="dl-label">클래스 신청 기간</span>
            <div class="dl-main"><span class="dl-d"><b>${esc(C.APPLY_DEADLINE.date)}</b><i>${esc(C.APPLY_DEADLINE.dow)}</i></span><span class="dl-bar"></span><b class="dl-t">${esc(C.APPLY_DEADLINE.time)}</b></div>
            <span class="dl-sub">까지</span>
          </div>
          <button class="submit ready end-btn" type="button" data-go="/apply"><span>클래스 신청</span></button>
        </div>
      </div>`;
  }

  function Done() {
    const chosen = state.lastChosen.map((s) => {
      const [date, time, ...name] = s.split(" ");
      return `<div>${esc(name.join(" "))}<span>${esc(date)} · ${esc(time)}</span></div>`;
    }).join("");
    return `
      <div class="done view">
        ${mesh()}
        <div class="ring"><svg viewBox="0 0 42 42"><path d="M10 22.5l8 8L32 13"/></svg></div>
        <h2>신청이<br /><em>완료되었습니다</em></h2>
        <p class="msg2">당첨자는 <b>${esc(C.ANNOUNCE_DATE)}</b><br />개별 안내드릴 예정입니다.</p>
        ${chosen ? `<div class="chosen">${chosen}</div>` : ""}
        <button class="cta" data-go="/"><span>처음으로</span></button>
      </div>`;
  }

  // ---------- 신청 마감 ----------
  // 사용자 기기 시계가 틀려도 마감이 정확하도록 서버 응답의 Date 헤더로 시차를 보정한다 (실패 시 기기 시계 사용)
  // 테스트용 가상 시각: 주소 끝에 ?closed (마감 시각) 또는 ?now=2026-10-14T23:59:30+09:00 을 붙이면 그 시각부터 시간이 흐르는 것처럼 동작한다.
  // 화면 표시만 바뀌며, 실제 접수 마감은 서버(Code.gs)가 실제 시각으로 판단한다.
  const q = new URLSearchParams(location.search);
  const testNow = q.has("closed") ? Date.parse(C.DEADLINE) : Date.parse((q.get("now") || "").replace(" ", "+")); // URL에서 +가 공백으로 바뀌는 것 보정
  let clockOffset = testNow ? testNow - Date.now() : 0;
  const isClosed = () => Date.now() + clockOffset >= new Date(C.DEADLINE).getTime();
  function syncClock() {
    if (testNow) return Promise.resolve(); // 가상 시각 사용 중에는 서버 시계로 덮어쓰지 않는다
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    return fetch(location.pathname, { method: "HEAD", cache: "no-store", signal: ctrl.signal })
      .then((r) => { const d = Date.parse(r.headers.get("Date") || ""); if (d) clockOffset = d - Date.now(); })
      .catch(() => {})
      .finally(() => clearTimeout(t));
  }

  function Closed() {
    return `
      <section class="closed view">
        <img class="closed-bg" src="assets/closed-kv.jpg" alt="" />
        <div class="closed-in">
          <h1 class="closed-logo"><img src="assets/popup-logo.png" alt="ANDAR. IN MOTION" /></h1>
          <p class="closed-msg">클래스 신청이 마감되었습니다.<br />안다르 인모션 클래스에 관심을 가져주셔서 감사합니다.</p>
        </div>
      </section>`;
  }

  // ---------- routing ----------
  const routes = { "/": Sessions, "/apply": Apply, "/sessions": Sessions, "/done": Done };
  const currentPath = () => location.hash.replace(/^#/, "") || "/";

  // 화면 전환 시 맨 위로. iOS Safari는 관성 스크롤 중이거나 스크롤 복원이 끼어들면 scrollTo를 무시하므로
  // 관성을 끊고(overflow:hidden 잠깐) 다음 프레임까지 한 번 더 맞춘다.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function scrollTop() {
    const root = document.documentElement;
    const toTop = () => { window.scrollTo(0, 0); root.scrollTop = 0; document.body.scrollTop = 0; };
    root.classList.add("no-scroll");
    toTop();
    requestAnimationFrame(() => {
      toTop();
      root.classList.remove("no-scroll");
      requestAnimationFrame(toTop);
    });
  }

  function route() {
    const path = currentPath();
    if (isClosed()) { app.innerHTML = Closed(); scrollTop(); return; }
    app.innerHTML = (routes[path] || Sessions)();
    scrollTop();
    if (path === "/apply") { bindApply(); syncSelection(); }
  }
  window.addEventListener("hashchange", route);

  document.addEventListener("click", (e) => {
    const ddBtn = e.target.closest(".dd-btn");
    const opt = e.target.closest(".dd-opt");
    const keepOpen = ddBtn ? ddBtn.closest(".dd") : opt ? opt.closest(".dd") : null;
    document.querySelectorAll(".dd.open").forEach((d) => { if (d !== keepOpen) closeDropdown(d); });
    if (ddBtn) return toggleDropdown(ddBtn.closest(".dd"));
    if (opt) return selectOption(opt);
    const doc = e.target.closest("[data-doc]");
    if (doc) return openDoc(doc.dataset.doc);
    if (e.target.id === "modal" || e.target.closest("[data-close]")) return closeModal();
    const stepBtn = e.target.closest("[data-step]");
    if (stepBtn) { readForm(); state.step = Number(stepBtn.dataset.step); state.error = ""; return route(); }
    if (e.target.closest("#next")) return goNext();
    const mBtn = e.target.closest("[data-mkt]");
    if (mBtn) return pickMkt(mBtn);
    const gBtn = e.target.closest("[data-gender]");
    if (gBtn) return pickGender(gBtn);
    const go = e.target.closest("[data-go]");
    if (go) { readForm(); if (go.dataset.go === "/apply") state.step = 1; location.hash = go.dataset.go; return; }
    const tile = e.target.closest("[data-session]");
    if (tile) toggleSession(tile.dataset.session);
  });

  // 팝업 (동의 원문 보기)
  function openModal(body, label, cls) {
    closeModal();
    // 닫기 버튼은 스크롤되는 내용 바깥(박스 오른쪽 위)에 두어 항상 보이게 한다
    app.insertAdjacentHTML("beforeend", `<div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <div class="sheet-wrap"><button type="button" class="x" data-close aria-label="닫기">×</button><div class="sheet ${cls || ""}">${body}</div></div></div>`);
  }
  function closeModal() {
    const m = document.getElementById("modal");
    if (m) m.remove();
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // 동의 원문 팝업 (문구는 config의 CONSENT_DOCS)
  function openDoc(key) {
    const d = C.CONSENT_DOCS[key];
    if (!d) return;
    openModal(`<h3 class="doc-t">${esc(d.title)}</h3><div class="doc-b">${esc(d.text).replace(/\n/g, "<br />")}</div>`, d.title);
  }

  function closeDropdown(dd) {
    dd.classList.remove("open");
    dd.querySelector(".dd-btn").setAttribute("aria-expanded", "false");
  }
  function toggleDropdown(dd) {
    const open = !dd.classList.contains("open");
    dd.classList.toggle("open", open);
    dd.querySelector(".dd-btn").setAttribute("aria-expanded", String(open));
  }
  function selectOption(opt) {
    const dd = opt.closest(".dd");
    const field = dd.closest(".f");
    const name = field.dataset.field;
    const value = opt.dataset.value;
    state.form[name] = value;
    const btn = dd.querySelector(".dd-btn");
    btn.querySelector(".dd-label").textContent = value;
    btn.classList.remove("empty");
    dd.querySelectorAll(".dd-opt").forEach((o) => {
      const on = o.dataset.value === value;
      o.classList.toggle("on", on);
      o.setAttribute("aria-selected", String(on));
    });
    closeDropdown(dd);
    field.classList.remove("err");
  }

  // 선택 상태는 화면을 다시 그리지 않고 제자리에서 갱신 (스크롤 유지)
  function toggleSession(id) {
    const i = state.selected.indexOf(id);
    if (i >= 0) state.selected.splice(i, 1);
    else if (state.selected.length < C.MAX_SESSIONS) state.selected.push(id);
    else return shake();
    state.error = "";
    document.getElementById("tiles").innerHTML = tiles();
    syncSelection();
  }
  function shake() {
    const el = document.getElementById("tiles");
    el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 260 });
    flashMsg(`세션은 최대 ${C.MAX_SESSIONS}개까지 선택할 수 있어요.`);
  }
  let msgTimer;
  // 경고 메시지는 2초 뒤 자동으로 사라진다 (진행 안내인 info 메시지는 유지)
  function setMsg(t, info) {
    clearTimeout(msgTimer);
    const m = document.getElementById("err");
    if (m) { m.textContent = t; m.classList.toggle("info", !!info); }
    state.error = t;
    if (t && !info) msgTimer = setTimeout(() => setMsg(""), 2000);
  }
  const flashMsg = (t) => setMsg(t);

  function syncSelection() {
    const n = state.selected.length;
    const c = document.getElementById("count");
    if (c) c.textContent = `${n} / ${C.MAX_SESSIONS} 선택`;
    renderSubmit();
  }
  function renderSubmit() {
    const b = document.getElementById("submit");
    if (!b) return;
    const n = state.selected.length;
    b.classList.add("ready");
    b.disabled = state.submitting;
    b.innerHTML = state.submitting
      ? '<span class="spin"></span><span>신청 중...</span>'
      : `<span>신청하기</span>${n ? `<span class="pill">${n}개 클래스</span>` : ""}`;
  }

  // ---------- form ----------
  const STEP1_FIELDS = ["name", "gender", "phone", "andarId"];
  const TEXT_FIELDS = ["name", "phone", "andarId", "instaId"];
  function readForm() {
    const f = document.getElementById("form");
    if (!f) return;
    TEXT_FIELDS.forEach((k) => { if (f.elements[k]) state.form[k] = f.elements[k].value.trim(); });
    if (f.elements.website) state.trap = f.elements.website.value;
  }
  function bindApply() {
    const f = document.getElementById("form");
    if (!state.openedAt) state.openedAt = Date.now();
    f.addEventListener("submit", onSubmit);
    // 연락처·안다르 아이디 칸을 벗어날 때만 중복을 미리 확인한다 (입력 중에는 요청하지 않아 서버 부하를 줄인다)
    f.addEventListener("focusout", (e) => { if (["phone", "andarId"].includes(e.target.name)) prefetchDup(); });
    f.addEventListener("change", (e) => { const c = e.target.closest(".cons"); if (c) c.classList.remove("err"); });
    f.addEventListener("input", (e) => {
      const fld = e.target.closest(".f");
      if (fld) fld.classList.remove("err");
      if (e.target.name === "phone") e.target.value = fmtPhone(e.target.value);
    });
  }
  function pickGender(btn) {
    if (state.form.gender && state.form.gender !== btn.dataset.gender) { delete state.form.top; delete state.form.bra; delete state.form.bottom; }
    state.form.gender = btn.dataset.gender;
    btn.closest(".gender").classList.remove("err");
    btn.closest(".gender-row").querySelectorAll(".g-btn").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }
  function pickMkt(btn) {
    state.mkt = btn.dataset.mkt;
    const wrap = btn.closest(".cons");
    wrap.classList.remove("err");
    wrap.querySelectorAll("[data-mkt]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }
  // 같은 연락처+안다르 아이디로 이미 신청했는지 NEXT 시점에 미리 확인 (네트워크 오류 시에는 통과).
  // 한 항목만 겹치는 경우(연락처만, 인스타만 등)는 최종 제출에서 서버가 항목별로 걸러낸다.
  const dupCache = {};
  const dupKey = (f) => [normPhone(f.phone || ""), f.andarId || ""].join("|");
  function checkDup() {
    const k = dupKey(state.form);
    if (!dupCache[k]) {
      const e = { done: false, val: null };
      e.p = requestDup().then((v) => { e.done = true; e.val = v; return v; });
      dupCache[k] = e;
    }
    return dupCache[k];
  }
  // 입력을 마치고 칸을 벗어나는 순간 미리 확인해 두면 NEXT에서는 기다릴 필요가 거의 없다
  function prefetchDup() {
    const f = document.getElementById("form");
    if (!f || !f.elements.phone || !f.elements.andarId) return;
    readForm();
    const v = state.form;
    if (!/^01[016789]\d{7,8}$/.test(normPhone(v.phone || "")) || !v.andarId) return;
    checkDup();
  }
  async function requestDup() {
    const f = state.form;
    const payload = { action: "check", phone: normPhone(f.phone), andarId: f.andarId };
    if (!C.GAS_URL) return mockCheck(payload);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(C.GAS_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), signal: ctrl.signal });
      const data = await res.json();
      return data && data.ok === false && data.field ? { field: data.field, msg: data.error } : null;
    } catch (_) { return null; } finally { clearTimeout(timer); }
  }
  function mockCheck(p) {
    const list = JSON.parse(localStorage.getItem("mockApplications") || "[]");
    const n = (v) => String(v || "").trim().toLowerCase();
    const same = list.some((a) => a.phone === p.phone && n(a.andarId) === n(p.andarId));
    return same ? { field: "phone", msg: "이미 신청하신 연락처와 안다르 아이디입니다." } : null;
  }
  // NEXT: 중복 확인 결과가 이미 와 있으면 바로 진행하고, 아직이면 버튼에 "확인 중"을 보여 주며 기다린다.
  // (입력하는 동안 미리 확인을 시작해 두므로 대부분은 기다리지 않는다)
  let waiting = false;
  async function goNext() {
    if (waiting) return;
    readForm();
    const v = validateStep1();
    if (v) return showError(v);
    const entry = checkDup();
    if (!entry.done) {
      waiting = true;
      const btn = document.getElementById("next");
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span><span>확인 중...</span>'; }
      await entry.p;
      waiting = false;
      if (btn) { btn.disabled = false; btn.innerHTML = "<span>NEXT</span>"; }
    }
    if (entry.val) return showError(entry.val);
    setMsg("");
    state.step = 2;
    route();
  }

  const normPhone = (p) => p.replace(/\D/g, "");
  function fmtPhone(v) {
    const d = normPhone(v).slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  }
  const LABELS = { name: "성함", gender: "성별", phone: "연락처", andarId: "안다르 아이디", top: "상의", bra: "브라탑", bottom: "하의", shoes: "운동화 사이즈" };
  const PICK = ["gender", "top", "bra", "bottom", "shoes"];

  function validateStep1() {
    const f = state.form;
    if (state.selected.length === 0) return { scroll: "tiles", msg: "참여할 클래스를 1개 이상 선택해주세요." };
    for (const k of STEP1_FIELDS) if (!f[k]) return { field: k, msg: `${LABELS[k]}을(를) ${PICK.includes(k) ? "선택" : "입력"}해주세요.` };
    if (!/^01[016789]\d{7,8}$/.test(normPhone(f.phone))) return { field: "phone", msg: "연락처 형식을 확인해주세요." };
    return null;
  }
  function validateStep2() {
    const f = state.form;
    const need = ["top", ...(f.gender === "여" ? ["bra"] : []), "bottom", ...(hasRun() ? ["shoes"] : [])];
    for (const k of need) if (!f[k]) return { field: k, msg: `${LABELS[k]}을(를) 선택해주세요.` };
    if (!state.mkt) return { field: "agreeMkt", msg: "마케팅 활용 동의 여부를 선택해주세요." };
    return null;
  }
  function showError(v) {
    document.querySelectorAll(".f.err, .cons.err").forEach((el) => el.classList.remove("err"));
    setMsg(v.msg);
    const target = v.field ? document.querySelector(`[data-field="${v.field}"]`) : document.getElementById(v.scroll);
    if (v.field) { target.classList.add("err"); void target.offsetWidth; }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (state.submitting) return;
    if (isClosed()) return route();
    readForm();
    const v1 = validateStep1();
    if (v1) { state.step = 1; route(); return showError(v1); }
    const v = validateStep2();
    if (v) return showError(v);
    setMsg("");
    state.submitting = true;
    renderSubmit();
    try {
      await submit({
        name: state.form.name,
        gender: state.form.gender,
        phone: normPhone(state.form.phone),
        andarId: state.form.andarId,
        instaId: state.form.instaId || "",
        sessions: state.selected,
        top: state.form.top,
        bra: state.form.gender === "여" ? state.form.bra : "-",
        bottom: state.form.bottom,
        shoes: hasRun() ? state.form.shoes : "-",
        agreedMarketing: state.mkt === "Y",
        website: state.trap || "",
        elapsed: Math.round((Date.now() - (state.openedAt || Date.now())) / 1000),
      });
      state.lastChosen = state.selected.slice();
      state.selected = []; state.form = {}; state.step = 1; state.mkt = ""; state.submitting = false; state.openedAt = 0;
      location.hash = "/done";
    } catch (err) {
      state.submitting = false;
      renderSubmit();
      setMsg(err.message || "신청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  // 접수가 몰려 서버가 바쁠 때(락 대기 초과·네트워크 끊김)는 자동으로 다시 시도한다
  const MAX_ATTEMPTS = 6;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isBusy = (msg) => /서버 오류|잠금/.test(msg || "");

  async function postOnce(payload) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      // text/plain 으로 보내 CORS preflight를 피한다 (Apps Script 웹앱 관례)
      const res = await fetch(C.GAS_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), signal: ctrl.signal });
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  async function submit(payload) {
    if (!C.GAS_URL) return mockSubmit(payload);
    let unsure = false; // 응답을 못 받아서 저장됐는지 모르는 상태
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let data = null;
      try { data = await postOnce(payload); } catch (_) { /* 네트워크/시간초과 */ }

      if (data && data.ok) return;
      // 재시도 중 "이미 신청"이 나오면 앞선 시도가 저장된 것으로 본다
      if (data && unsure && /이미 신청/.test(data.error || "")) return;
      // 검증 실패 등 다시 해도 소용없는 오류는 바로 알린다
      if (data && !isBusy(data.error)) throw new Error(data.error || "신청에 실패했어요.");

      if (!data) unsure = true;
      if (attempt === MAX_ATTEMPTS) break;
      setMsg("접수 중이에요. 잠시만 기다려주세요.", true);
      await sleep(2000 + Math.random() * 3000); // 동시에 재시도가 몰리지 않게 분산
    }
    throw new Error("접수가 몰려 처리하지 못했어요. 잠시 후 다시 시도해주세요.");
  }

  // GAS_URL이 없을 때: 브라우저에 저장 (시연용). 콘솔에서 localStorage.mockApplications 확인 가능
  function mockSubmit(payload) {
    return new Promise((resolve, reject) => setTimeout(() => {
      const list = JSON.parse(localStorage.getItem("mockApplications") || "[]");
      const nId = (s) => String(s || "").trim().toLowerCase();
      const nInsta = (s) => nId(s).replace(/^@/, "");
      if (list.some((a) => a.phone === payload.phone)) return reject(new Error("이미 신청된 연락처입니다."));
      if (list.some((a) => nId(a.andarId) === nId(payload.andarId))) return reject(new Error("이미 신청된 안다르 아이디입니다."));
      if (nInsta(payload.instaId) && list.some((a) => nInsta(a.instaId) === nInsta(payload.instaId))) return reject(new Error("이미 신청된 인스타 아이디입니다."));
      list.push({ ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem("mockApplications", JSON.stringify(list));
      resolve();
    }, 700));
  }

  // 가상 시각 테스트 중임을 화면 구석에 표시 (현재 가상 시각이 1초마다 갱신됨)
  if (testNow) {
    const badge = document.createElement("div");
    badge.className = "test-badge";
    document.body.appendChild(badge);
    const tick = () => { badge.textContent = `TEST ${new Date(Date.now() + clockOffset).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })}`; };
    tick();
    setInterval(tick, 1000);
  }

  // 첫 화면(링크 접속)이면 인트로를 바로 띄운다 (마감 후에는 생략)
  // 페이지는 기기 시계로 바로 그리고, 서버 시계 보정은 뒤에서 마친 뒤 마감 여부가 달라졌을 때만 다시 그린다
  const splashDone = currentPath() === "/" && !isClosed() ? showSplash() : null;
  route();
  if (splashDone) splashDone();
  syncClock().then(() => {
    if (isClosed() !== !!document.querySelector(".closed")) route();
    // 페이지를 열어 둔 채 마감 시각이 지나면 종료 화면으로 전환
    setInterval(() => { if (isClosed() && !document.querySelector(".closed")) route(); }, 15000);
  });
})();
