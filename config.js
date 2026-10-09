// 서비스 설정값 — 실제 자료 수령 후 여기만 수정하면 됩니다.
window.APP_CONFIG = {
  // Google Apps Script 웹앱 URL (gas/README.md 참고). 비워두면 mock 모드(브라우저 localStorage에 저장)로 동작합니다.
  GAS_URL: "https://script.google.com/macros/s/AKfycbyO-Dy0yDqlmeddPecLY282XrCAH4SDUElwa5KW6MlxzMrucCj4I8OPTrA6pbImtANHJA/exec",

  ANNOUNCE_DATE: "10/16(금)",
  MAX_SESSIONS: 2,

  // 1P 행사 정보
  EVENT: { period: "2026.10.24(토) ~ 2026.10.25(일)", place: "Y173 - 성수동 연무장17길 3" },

  // 사이즈표 이미지 경로 (10/7 확정 전달 예정). 비워두면 안내 문구가 표시됩니다.
  SIZE_CHART_IMAGE: "",

  // ※ MAX_SESSIONS / DATES / SCHEDULE / SIZES를 바꾸면 `node gas/sync.js` 실행 후 Code.gs를 재배포해야 합니다.

  // 시간표: 행 = 시간대, 열 = 날짜. 각 셀은 세션명. 요일은 YEAR와 날짜로 자동 계산됩니다.
  YEAR: 2026,
  DATES: ["10/24", "10/25"],
  SCHEDULE: [
    { time: "10:30", end: "12:00", sessions: ["STRETCH YOUR RUN", "STRETCH YOUR RUN"] },
    { time: "12:30", end: "14:00", sessions: ["MUSIC FLOW YOGA", "POWER PILATES"] },
    { time: "16:30", end: "18:00", sessions: ["BURN BOOT CAMP", "MOVE & RESET YOGA"] },
    { time: "19:30", end: "20:30", sessions: ["K-SOUND BATH", "K-SOUND BATH"] },
  ],

  // 드롭다운 옵션 (가정값 — 실제 사이즈표로 교체 필요)
  SIZES: {
    bra: ["XS", "S", "M", "L", "XL"],
    zipup: ["XS", "S", "M", "L", "XL"],
    leggings: [
      "숏 XS", "숏 S", "숏 M", "숏 L", "숏 XL",
      "레귤러 XS", "레귤러 S", "레귤러 M", "레귤러 L", "레귤러 XL",
      "롱 XS", "롱 S", "롱 M", "롱 L", "롱 XL",
    ],
    shoes: ["225", "230", "235", "240", "245", "250", "255", "260", "265", "270", "275", "280"],
  },

  // 3P 동의 원문 팝업 — 실제 원문은 안다르 측 확정 후 교체 (오픈 전 필수)
  CONSENT_DOCS: {
    marketing: {
      title: "마케팅 활용동의",
      text: [
        "이벤트 당일 현장의 모습을 사진과 영상으로 기록할 예정이며,",
        "이는 브랜드의 마케팅 콘텐츠로 활용될 수 있습니다.",
        "다음 내용을 확인하신 후 동의 여부를 선택해 주세요.",
        "",
        "1. 수집 및 이용 목적",
        "이벤트 현장 스케치 등 마케팅 콘텐츠 제작 및 브랜드 홍보, 비상업적 목적의 기록·편집 및 보관",
        "",
        "2. 수집 항목",
        "이벤트 참석자의 사진 및 영상 등 콘텐츠",
        "",
        "3. 이용 기간",
        "상업적 용도 홍보물의 경우 촬영일로부터 1년간",
        "",
        "※ 비상업적 기록·편집물의 경우 별도의 추가 비용 없이 영구 보관 및 활용될 수 있습니다.",
        "",
        "4. 활용 범위",
        "안다르 공식 SNS, 유튜브, 자사몰, 브랜드 사이트, 오프라인 매장 및 전시·행사 등",
      ].join("\n"),
    },
    third: {
      title: "개인정보 처리업무 위탁안내",
      text: [
        "수탁업체: [에이전시명]",
        "위탁 업무: 클래스 운영 및 참가자 관리, VIP 고객 대상 선물 제공",
        "위탁하는 개인정보 항목: 이름, 휴대전화번호",
        "개인정보 보유 및 이용 기간: 클래스 운영 및 선물 제공 목적 달성 후 지체 없이 파기",
      ].join("\n"),
    },
    notice: {
      title: "유의 사항",
      text: [
        "• 본 클래스는 최종 참가 확정자에 한해 참여 가능하며, 최종 참가 여부는 개별 연락을 통해 확정될 예정입니다.",
        "• 클래스별 특성에 맞는 편안한 복장을 제공하여 현장에서 지급예정이니,",
        "원활한 환복을 위해 클래스 시작 30분 전까지 도착해 주세요.",
        "• 클래스 참가 전 건강 상태를 체크하고 클래스 진행 중 몸에 불편함이 느껴질 경우 즉시 진행자에게 알려주세요.",
        "• 본 클래스 및 강사진은 상황에 따라 변경 및 취소될 수 있습니다.",
      ].join("\n"),
    },
  },

  // 3P 세션 정보 (이미지/문구는 자료 수령 후 교체. image에 경로를 넣으면 표시됩니다)
  MAIN_MOTION: [
    { title: "MUSIC FLOW YOGA", text: "음악과 함께 흐르는 요가", image: "" },
    { title: "POWER PILATES", text: "움직임에 집중하는 필라테스", image: "" },
    { title: "BURN BOOT CAMP", text: "에너지를 끌어올리는 강도 높은 세션", image: "" },
    { title: "MOVE & RESET YOGA", text: "문구는 확정 후 전달 예정입니다.", image: "" },
  ],
  STRETCH_YOUR_RUN: {
    subtitle: "트레이닝 + 슬로우조깅",
    text: "가볍게 달리고, 충분히 늘리고, 함께 완주하는 러닝 세션",
    image: "",
  },
  K_SOUND_BATH: {
    subtitle: "사운드 배스",
    text: "이미지·문구는 10/7 확정 후 전달 예정입니다.",
    image: "",
  },
  SPECIAL_GIFT: {
    subtitle: "참가자 전원 증정",
    text: "이미지·문구는 10/7 확정 후 전달 예정입니다.",
    image: "",
  },
};
