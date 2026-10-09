(function () {
  const C = window.APP_CONFIG;
  const app = document.getElementById("app");

  // 페이지 이동 간에 유지되는 입력 상태
  const state = { selected: [], form: {}, agree: false, submitting: false, error: "", lastChosen: [] };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sessionId = (date, time, name) => `${date} ${time} ${name}`;
  const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dow = (d) => { const [m, day] = d.split("/").map(Number); return DOW_NAMES[new Date(C.YEAR, m - 1, day).getDay()]; };

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    check: '<svg viewBox="0 0 12 12" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.4l2.6 2.6L10 3.4"/></svg>',
    chevron: '<svg viewBox="0 0 14 9" fill="none"><path d="M1 1.5l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const mesh = () => '<div class="mesh kv"><img src="assets/keyvisual.png" alt="" /></div><div class="grain"></div>';

  // ---------- pages ----------
  function Home() {
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
            <p>${esc(C.EVENT.period)}<br />${esc(C.EVENT.place)}</p>
          </div>
          <button class="cta" data-go="/sessions"><span>세션 신청</span><span class="arrow">${ICON.arrow}</span></button>
        </div>
      </section>`;
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
  // 동의 항목: 제목 + 내용 보기(원문 팝업) + 체크
  function consent(name, title, doc, label) {
    return `<div class="cons" data-field="${name}">
      <div class="cons-h"><b>${title}</b><button type="button" class="chart-btn" data-doc="${doc}">내용 보기</button></div>
      <label class="agree"><input type="checkbox" name="${name}" ${state[name] ? "checked" : ""} /><span class="box">${ICON.check}</span><span>${label}</span></label>
    </div>`;
  }

  // 사이즈 드롭다운 + 사이즈표 확인 버튼
  function sizeField(name, label, options) {
    return selectField(name, label, options, `<button type="button" class="chart-btn" data-chart>* 사이즈표 확인</button>`);
  }
  function inputField(name, label, attrs) {
    return `<div class="f" data-field="${name}"><label>${label}</label><input class="in" name="${name}" value="${esc(state.form[name] || "")}" ${attrs || ""} /></div>`;
  }

  function Apply() {
    return `
      <div class="split view">
      <div class="page main">
        <div class="top"><button class="back" data-go="/sessions" aria-label="뒤로">${ICON.back}</button><div class="ttl">Session Application<small>ANDAR. IN MOTION</small></div></div>
        <div class="wrap">
          <div class="notice">
            <b>* 세션 신청 시 유의사항 *</b>
            세션은 최대 ${C.MAX_SESSIONS}개까지 신청 가능하며, 최종 참가자는 세션별로 추첨을 통해 선정됩니다.<br />
            최종 참가자에게는 ${esc(C.ANNOUNCE_DATE)} 개별 연락드릴 예정입니다.
          </div>

          <section class="sec">
            <div class="sec-h"><span class="no">01</span><h2>Session</h2><span class="aux" id="count"></span></div>
            <div id="tiles">${tiles()}</div>
          </section>

          <form id="form" novalidate>
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />
            <section class="sec">
              <div class="sec-h"><span class="no">02</span><h2>Information</h2></div>
              <div class="form">
                ${inputField("name", "성함", 'autocomplete="name" placeholder="홍길동"')}
                ${inputField("phone", "연락처", 'type="tel" inputmode="numeric" placeholder="010-0000-0000" autocomplete="tel"')}
                ${inputField("andarId", "안다르 아이디", 'autocapitalize="off" autocomplete="off" placeholder="andar_id"')}
                ${inputField("instaId", "인스타 아이디 <em>(선택)</em>", 'autocapitalize="off" autocomplete="off" placeholder="@instagram_id"')}
              </div>
            </section>
            <section class="sec">
              <div class="sec-h"><span class="no">03</span><h2>Gift</h2><span class="aux">기프트 사이즈 및 배송지 정보</span></div>
              <div class="form">
                ${sizeField("bra", "브라탑 사이즈", C.SIZES.bra)}
                ${sizeField("zipup", "집업 사이즈", C.SIZES.zipup)}
                ${sizeField("leggings", "레깅스 기장 및 사이즈", C.SIZES.leggings)}
                ${sizeField("shoes", "신발 사이즈 <em>mm</em>", C.SIZES.shoes)}
                <div class="f" data-field="zip"><label>우편번호</label>
                  <div class="zip-row"><input class="in" name="zip" value="${esc(state.form.zip || "")}" readonly placeholder="우편번호 검색 후 입력돼요" data-postcode /><button type="button" class="pc-btn" data-postcode>우편번호 검색</button></div></div>
                <div class="f" data-field="address"><label>기본주소</label><input class="in" name="address" value="${esc(state.form.address || "")}" readonly placeholder="우편번호 검색 시 자동으로 입력돼요" data-postcode /></div>
                ${inputField("addressDetail", "상세주소", 'autocomplete="address-line2" placeholder="동/호수 등 상세주소"')}
              </div>
            </section>
            <section class="sec">
              <label class="agree"><input type="checkbox" name="agree" ${state.agree ? "checked" : ""} /><span class="box">${ICON.check}</span>
                <span><b>[필수] 개인정보 수집·이용 동의</b><br />
                · 수집 항목: 성함, 연락처, 안다르 아이디, 인스타 아이디(선택), 기프트 사이즈, 배송지(우편번호·주소)<br />
                · 수집·이용 목적: 참가자 추첨·선정, 개별 안내, 기프트 배송<br />
                · 보유·이용 기간: 행사 종료 후 파기<br />
                · 동의를 거부할 수 있으나, 거부 시 세션 신청이 불가합니다.</span></label>
            </section>
            <section class="sec cons-sec">
              ${consent("agreeMkt", "마케팅 활용동의", "marketing", "네, 동의합니다")}
              ${consent("agreeThird", "제 3자 정보제공동의", "third", "네, 동의합니다")}
              ${consent("agreeNotice", "유의 사항 확인", "notice", "네, 확인했습니다")}
            </section>
          </form>
        </div>
        <div class="dock"><p class="msg" id="err">${esc(state.error)}</p><button class="submit" id="submit" type="submit" form="form"></button></div>
      </div>
      </div>`;
  }

  function art(item, i, cls) {
    const img = item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title || "")}" />` : `<div class="mesh kv"><img src="assets/keyvisual.png" alt="" /></div>`;
    return `<div class="art v${(i % 4) + 1} ${cls || ""}">${img}<span class="no">${String(i + 1).padStart(2, "0")}</span></div>`;
  }

  function Sessions() {
    const cards = C.MAIN_MOTION.map((m, i) => `
      <div class="card">${art(m, i)}<div class="body"><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div></div>`).join("");
    const wide = (title, r) => `
          <section class="group"><div class="group-h"><h2>${title}</h2></div>
            <div class="cards"><div class="card wide">${art(r, 0)}<div class="body"><span class="tag">${esc(r.subtitle)}</span><h3>${title}</h3><p>${esc(r.text)}</p></div></div></div>
          </section>`;
    return `
      <div class="page sessions-page view">
        <div class="top"><button class="back" data-go="/" aria-label="뒤로">${ICON.back}</button><div class="ttl">ANDAR. IN MOTION<small>SPECIAL SESSION</small></div></div>
        <div class="wrap">
          <section class="group"><div class="group-h"><h2>MAIN MOTION</h2></div><div class="cards">${cards}</div></section>
          ${wide("STRETCH YOUR RUN", C.STRETCH_YOUR_RUN)}
          ${wide("K-SOUND BATH", C.K_SOUND_BATH)}
          ${wide("SPECIAL GIFT", C.SPECIAL_GIFT)}
        </div>
        <div class="wrap"><button class="submit ready end-btn" type="button" data-go="/apply"><span>세션 신청</span></button></div>
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

  // ---------- routing ----------
  const routes = { "/": Home, "/apply": Apply, "/sessions": Sessions, "/done": Done };
  function route() {
    const path = location.hash.replace(/^#/, "") || "/";
    app.innerHTML = (routes[path] || Home)();
    window.scrollTo(0, 0);
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
    if (e.target.closest("[data-chart]")) return openChart();
    const doc = e.target.closest("[data-doc]");
    if (doc) return openDoc(doc.dataset.doc);
    if (e.target.closest("[data-postcode]")) return openPostcode();
    if (e.target.id === "modal" || e.target.closest("[data-close]")) return closeModal();
    const go = e.target.closest("[data-go]");
    if (go) { readForm(); location.hash = go.dataset.go; return; }
    const tile = e.target.closest("[data-session]");
    if (tile) toggleSession(tile.dataset.session);
  });

  // 사이즈표 팝업 (이미지는 config의 SIZE_CHART_IMAGE, 없으면 안내 문구)
  function openModal(body, label, cls) {
    closeModal();
    app.insertAdjacentHTML("beforeend", `<div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <div class="sheet ${cls || ""}"><button type="button" class="x" data-close aria-label="닫기">×</button>${body}</div></div>`);
  }
  function closeModal() {
    const m = document.getElementById("modal");
    if (m) m.remove();
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function openChart() {
    openModal(C.SIZE_CHART_IMAGE
      ? `<img src="${esc(C.SIZE_CHART_IMAGE)}" alt="사이즈표" />`
      : '<p class="empty">사이즈표는 10/7 확정 후 안내될 예정입니다.</p>', "사이즈표");
  }
  // 동의 원문 팝업 (문구는 config의 CONSENT_DOCS)
  function openDoc(key) {
    const d = C.CONSENT_DOCS[key];
    if (!d) return;
    openModal(`<h3 class="doc-t">${esc(d.title)}</h3><div class="doc-b">${esc(d.text).replace(/\n/g, "<br />")}</div>`, d.title);
  }

  // 우편번호 검색 (카카오 우편번호 서비스)
  let postcodeLoading;
  function loadPostcode() {
    if (window.daum && window.daum.Postcode) return Promise.resolve();
    if (!postcodeLoading) {
      postcodeLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        s.onload = resolve;
        s.onerror = () => { postcodeLoading = null; reject(new Error("load")); };
        document.head.appendChild(s);
      });
    }
    return postcodeLoading;
  }
  function openPostcode() {
    loadPostcode().then(() => {
      openModal('<div id="postcode"></div>', "우편번호 검색", "pc");
      new window.daum.Postcode({
        width: "100%", height: "100%",
        oncomplete: (d) => {
          const f = document.getElementById("form");
          if (!f) return;
          f.elements.zip.value = d.zonecode;
          f.elements.address.value = d.userSelectedType === "J" ? d.jibunAddress : d.roadAddress;
          f.querySelectorAll('[data-field="zip"], [data-field="address"]').forEach((el) => el.classList.remove("err"));
          readForm();
          closeModal();
          f.elements.addressDetail.focus();
        },
      }).embed(document.getElementById("postcode"));
    }).catch(() => setMsg("주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해주세요."));
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
    b.classList.toggle("ready", n > 0);
    b.disabled = state.submitting;
    b.innerHTML = state.submitting
      ? '<span class="spin"></span><span>신청 중...</span>'
      : `<span>신청하기</span>${n ? `<span class="pill">${n}개 세션</span>` : ""}`;
  }

  // ---------- form ----------
  const FIELDS = ["name", "phone", "andarId", "bra", "zipup", "leggings", "shoes", "zip", "address", "addressDetail"];
  const CONSENTS = ["agreeMkt", "agreeThird", "agreeNotice"]; // 모두 필수
  const TEXT_FIELDS =["name", "phone", "andarId", "instaId", "zip", "address", "addressDetail"];
  function readForm() {
    const f = document.getElementById("form");
    if (!f) return;
    TEXT_FIELDS.forEach((k) => { state.form[k] = f.elements[k].value.trim(); });
    state.trap = f.elements.website ? f.elements.website.value : "";
    state.agree = f.elements.agree.checked;
    CONSENTS.forEach((k) => { state[k] = f.elements[k].checked; });
  }
  function bindApply() {
    const f = document.getElementById("form");
    if (!state.openedAt) state.openedAt = Date.now();
    f.addEventListener("submit", onSubmit);
    f.addEventListener("change", (e) => { const c = e.target.closest(".cons"); if (c) c.classList.remove("err"); });
    f.addEventListener("input", (e) => {
      const fld = e.target.closest(".f");
      if (fld) fld.classList.remove("err");
      if (e.target.name === "phone") e.target.value = fmtPhone(e.target.value);
    });
  }

  const normPhone = (p) => p.replace(/\D/g, "");
  function fmtPhone(v) {
    const d = normPhone(v).slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  }
  const LABELS = { name: "성함", phone: "연락처", andarId: "안다르 아이디", bra: "브라탑 사이즈", zipup: "집업 사이즈", leggings: "레깅스 기장 및 사이즈", shoes: "신발 사이즈", zip: "우편번호", address: "주소", addressDetail: "상세주소" };

  function validate() {
    const f = state.form;
    if (state.selected.length === 0) return { scroll: "tiles", msg: "참여할 세션을 1개 이상 선택해주세요." };
    for (const k of FIELDS) if (!f[k]) return { field: k, msg: `${LABELS[k]}을(를) ${["bra", "zipup", "leggings", "shoes"].includes(k) ? "선택" : "입력"}해주세요.` };
    if (!/^01[016789]\d{7,8}$/.test(normPhone(f.phone))) return { field: "phone", msg: "연락처 형식을 확인해주세요." };
    if (!/^\d{5}$/.test(f.zip)) return { field: "zip", msg: "우편번호 5자리를 확인해주세요." };
    if (!state.agree) return { scroll: "form", msg: "개인정보 수집·이용에 동의해주세요." };
    if (!state.agreeMkt) return { field: "agreeMkt", msg: "마케팅 활용에 동의해주세요." };
    if (!state.agreeThird) return { field: "agreeThird", msg: "제 3자 정보제공에 동의해주세요." };
    if (!state.agreeNotice) return { field: "agreeNotice", msg: "유의 사항을 확인해주세요." };
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
    readForm();
    const v = validate();
    if (v) return showError(v);
    setMsg("");
    state.submitting = true;
    renderSubmit();
    try {
      await submit({
        name: state.form.name,
        phone: normPhone(state.form.phone),
        andarId: state.form.andarId,
        instaId: state.form.instaId || "",
        zip: state.form.zip,
        address: state.form.address,
        addressDetail: state.form.addressDetail,
        sessions: state.selected,
        bra: state.form.bra,
        zipup: state.form.zipup,
        leggings: state.form.leggings,
        shoes: state.form.shoes,
        agreed: true,
        agreedMarketing: true,
        agreedThird: true,
        agreedNotice: true,
        website: state.trap || "",
        elapsed: Math.round((Date.now() - (state.openedAt || Date.now())) / 1000),
      });
      state.lastChosen = state.selected.slice();
      state.selected = []; state.form = {}; state.agree = false; CONSENTS.forEach((k) => { state[k] = false; }); state.submitting = false; state.openedAt = 0;
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

  route();
})();
