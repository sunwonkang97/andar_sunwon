// 서비스 설정값 — 실제 자료 수령 후 여기만 수정하면 됩니다.
window.APP_CONFIG = {
  // Google Apps Script 웹앱 URL (gas/README.md 참고). 비워두면 mock 모드(브라우저 localStorage에 저장)로 동작합니다.
  GAS_URL: "https://script.google.com/macros/s/AKfycbx2RQH5wUdVntvJ90_JOR0cj7zipCCYG7UABcnXa46NkVQQh0NIpLUNDo0wjgelnu6V/exec",

  // 신청 마감: 10/14(수) 24:00 = 10/15 00:00 (KST). 이후 종료 페이지 → TAKEDOWN 이후 배포 내림(404)
  DEADLINE: "2026-10-15T00:00:00+09:00",
  TAKEDOWN: "2026-10-18T00:00:00+09:00",

  ANNOUNCE_DATE: "10/16(금)",
  MAX_SESSIONS: 2,

  // 1P 행사 정보
  EVENT: { period: "2026.10.24(토) ~ 2026.10.25(일)", place: "Y173 - 성수동 연무장17길 3", periodShort: "2026.10.24(토) - 10.25(일)", address: "서울 성동구 연무장길 17길 3, Y173" },

  // ※ MAX_SESSIONS / DEADLINE / DATES / SCHEDULE / SIZES를 바꾸면 `node gas/sync.js` 실행 후 Code.gs를 재배포해야 합니다.

  // 시간표: 행 = 시간대, 열 = 날짜. 각 셀은 세션명. 요일은 YEAR와 날짜로 자동 계산됩니다.
  YEAR: 2026,
  DATES: ["10/24", "10/25"],
  SCHEDULE: [
    { time: "10:30", end: "12:00", sessions: ["STRETCH YOUR RUN", "STRETCH YOUR RUN"] },
    { time: "12:30", end: "14:00", sessions: ["MUSIC FLOW YOGA", "POWER PILATES"] },
    { time: "16:30", end: "18:00", sessions: ["BURN BOOT CAMP", "MOVE & RESET YOGA"] },
    { time: "19:30", end: "20:30", sessions: ["K - SOUND BATH", "K - SOUND BATH"] },
  ],

  // 사이즈 드롭다운 옵션 (성별에 따라 다름)
  SIZES: {
    male: { top: ["M", "L", "XL", "2XL"], bottom: ["M", "L", "XL", "2XL"] },
    female: { top: ["S", "M", "L", "XL"], bra: ["S", "M", "L", "XL"], bottom: ["S", "M", "L", "XL"] },
    shoes: ["230", "235", "240", "245", "250", "255", "260", "265", "270", "275"],
  },

  // 문안 (팝업 / 본문 박스에 표시)
  CONSENT_DOCS: {
    marketing: { title: "마케팅 활용 동의", text: [
      "이벤트 당일 현장의 모습을 사진과 영상으로 기록할 예정이며,",
      "이는 브랜드의 마케팅 콘텐츠로 활용될 수 있습니다.",
      "다음 내용을 확인하신 후 동의 여부를 선택해 주세요.",
      "",
      "1. 수집 및 이용 목적",
      "이벤트 현장 스케치 등 마케팅 콘텐츠 제작 및 브랜드 홍보, 비상업적 목적의 기록·편집 및 보관",
      "",
      "2. 수집 및 이용 항목",
      "이벤트 참석자의 사진 및 영상 등 콘텐츠",
      "",
      "3. 보유 및 이용 기간",
      "상업적 용도 홍보물의 경우 촬영일로부터 1년간",
      "",
      "※ 비상업적 기록·편집물의 경우 별도의 추가 비용 없이 영구 보관 및 활용될 수 있습니다.",
      "",
      "4. 활용 범위",
      "안다르 공식 SNS, 유튜브, 자사몰, 브랜드 사이트, 오프라인 매장 및 전시·행사 등",
      "",
      "5. 동의 거부 권리 및 동의 거부에 따른 불이익",
      "신청자는 사진·영상 촬영 및 마케팅 활용에 대한 동의를 거부할 수 있습니다. 다만, 원활한 클래스 운영 및 현장 기록을 위해 동의 여부에 따라 참여가 제한될 수 있는 점 양해 부탁드립니다.",
    ].join("\n") },
    third: { title: "개인정보 처리업무 위탁안내", text: [
      "수탁업체: 주식회사 크로인, 스타치하우스(Starch Haus)",
      "위탁 업무: 클래스 운영 및 참가자 관리, 참가자 대상 선물 제공",
      "위탁하는 개인정보 항목: 이름, 휴대전화번호",
      "개인정보 보유 및 이용 기간: 클래스 운영 및 선물 제공 목적 달성 후 지체 없이 파기",
    ].join("\n") },
    notice: { title: "유의사항", text: [
      "• 본 클래스는 최종 참가 확정자에 한해 참여 가능하며, 최종 참가자는 개별 문자 발송을 통해 확정될 예정입니다.",
      "• 클래스별 특성에 맞는 편안한 복장을 제공하여 현장에서 지급예정이니, 원활한 준비를 위해 클래스 시작 30분 전까지 도착해 주세요.",
      "• 클래스 참가 전 건강 상태를 체크하고 클래스 진행 중 몸에 불편함이 느껴질 경우 즉시 진행자에게 알려주세요.",
      "• 본 클래스 및 강사진은 상황에 따라 변경 및 취소될 수 있습니다.",
    ].join("\n") },
  },

  // 2P 클래스 정보
  INTRO: {
    lead: ["움직임을 일상으로 확장하는", "새로운 태도와 가능성", "안다르의 첫번째 팝업이 열립니다."],
    sub: ["안다르 ambassador가 리드하는 다양한 클래스와 함께", "팝업에서 최초 공개되는 에어쿨링 캡슐 컬렉션이 제공됩니다."],
  },
  APPLY_DEADLINE: { date: "10.14", dow: "WED", time: "24:00" },

  // 날짜별 클래스 (이미지는 assets/session)
  MAIN_MOTION: [
    { day: "10.24 (토)", classes: [
      { title: "MUSIC FLOW YOGA", time: "10.24(토)\n12:30 ~ 14:00", text: "음악 속에서 몸의 긴장을 천천히 풀어내며, 자연스럽게 흘러가는 요가를 경험해 보세요", image: "assets/session/class-1.jpg" },
      { title: "BURN BOOT CAMP", time: "10.24(토)\n16:30 ~ 18:00", text: "온몸을 고루 사용하는 전신 트레이닝으로 힘차게 움직이며 효율적으로 에너지를 깨워요", image: "assets/session/class-2.jpg" },
    ] },
    { day: "10.25 (일)", classes: [
      { title: "POWER PILATES", time: "10.25(일)\n12:30 ~ 14:00", text: "미니 짐볼의 불안정성을 활용한 매트 필라테스로 코어부터 전신까지 균형있게 만들어 보세요", image: "assets/session/class-3.jpg" },
      { title: "MOVE & RESET YOGA", time: "10.25(일)\n16:30 ~ 18:00", text: "걷고 뛰는 동작에 필요한 근력을 깨우고, 이완 요가로 몸의 긴장까지 천천히 풀어 보세요", image: "assets/session/class-4.jpg" },
    ] },
  ],
  SPECIAL_DATE: "10.24 (토), 10.25 (일)",
  STRETCH_YOUR_RUN: {
    title: "STRETCH YOUR RUN",
    subtitle: "트레이닝 + 슬로우조깅 4K",
    time: "10.24(토), 10.25(일)\n10:30 ~ 12:00",
    text: "하이브리드 트레이닝과 함께 성수 일대를 가볍게 달리며 스페셜 체크포인트에서 스트레칭과 음료로 잠시 여유를 즐겨보세요",
    image: "assets/session/stretch-your-run.jpg",
  },
  K_SOUND_BATH: {
    title: "K-SOUND BATH",
    subtitle: "가야금 사운드배스 + 연꽃차 세레모니 명상",
    time: "10.24(토) & 10.25(일)\n19:30 ~ 20:30",
    text: "가야금의 깊고 고요한 울림 속에서 몸과 마음의 이완을 느끼고, 따뜻한 연꽃차와 함께 지금 이 순간에 머물러 보세요",
    image: "assets/session/k-sound-bath.jpg",
  },
};
