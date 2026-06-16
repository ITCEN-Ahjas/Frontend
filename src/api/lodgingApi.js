// API 호출 함수
// 더미 데이터, 나중에 실제 API로 교체
const DUMMY_LODGINGS = [
  {
    id: 1,
    name: "청주 도심 비즈니스 호텔",
    area: "청주",
    address: "충청북도 청주시 상당구 성안길 123",
    priceFrom: 98000,
    rating: 4.6,
    reviewCount: 1284,
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    tags: ["비즈니스", "도심"],
    aiSummary:
      "성안길 도보 접근이 편리하고 조식 메뉴가 다양하다는 평이 많습니다. 직원 응대가 친절하며 체크인이 빠릅니다.",
    positiveTags: ["조식 만족", "위치 최고", "체크인 빠름"],
    cautionTags: ["주차 협소"],
    reviews: [
      {
        author: "김**",
        rating: 5,
        content: "위치가 너무 좋아요. 성안길 바로 옆이라 쇼핑하기 편했어요.",
        writtenAt: "2024-11",
      },
      {
        author: "이**",
        rating: 4,
        content: "조식이 정말 다양하고 맛있었어요. 직원분들도 친절했습니다.",
        writtenAt: "2024-10",
      },
      {
        author: "박**",
        rating: 4,
        content: "청결도는 완벽했어요. 다만 주차 공간이 좁아서 불편했습니다.",
        writtenAt: "2024-09",
      },
      {
        author: "최**",
        rating: 5,
        content: "체크인이 정말 빠르고 방도 넓었어요. 다음에 또 오고 싶어요.",
        writtenAt: "2024-08",
      },
      {
        author: "정**",
        rating: 3,
        content:
          "가격 대비 평범했어요. 위치는 좋지만 시설이 조금 노후했습니다.",
        writtenAt: "2024-07",
      },
    ],
  },
  {
    id: 2,
    name: "제천 청풍호 리조트",
    area: "제천",
    address: "충청북도 제천시 청풍면 청풍호로 456",
    priceFrom: 154000,
    rating: 4.8,
    reviewCount: 842,
    imageUrl:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    tags: ["리조트", "호수뷰"],
    aiSummary:
      "청풍호 전망이 뛰어나고 자연 속에서 휴식하기 좋다는 리뷰가 많습니다. 가족 단위 여행객에게 특히 추천됩니다.",
    positiveTags: ["호수뷰 탁월", "가족 여행 추천", "자연 휴양"],
    cautionTags: ["시내에서 거리 있음"],
    reviews: [
      {
        author: "강**",
        rating: 5,
        content:
          "청풍호 뷰가 정말 장관이에요. 방에서 호수가 바로 보여서 힐링됐습니다.",
        writtenAt: "2024-11",
      },
      {
        author: "윤**",
        rating: 5,
        content:
          "가족들이랑 왔는데 아이들도 너무 좋아했어요. 수영장 시설도 깔끔합니다.",
        writtenAt: "2024-10",
      },
      {
        author: "장**",
        rating: 4,
        content: "조용하고 자연 속에 있어서 완전한 휴식이 됐어요.",
        writtenAt: "2024-09",
      },
      {
        author: "임**",
        rating: 5,
        content: "뷰도 좋고 조식도 맛있고. 직원 서비스도 훌륭했어요.",
        writtenAt: "2024-08",
      },
      {
        author: "오**",
        rating: 4,
        content: "시내에서 조금 멀긴 하지만 그 덕분에 조용해요.",
        writtenAt: "2024-07",
      },
    ],
  },
  {
    id: 3,
    name: "단양 감성 스테이",
    area: "단양",
    address: "충청북도 단양군 단양읍 도전리 789",
    priceFrom: 132000,
    rating: 4.7,
    reviewCount: 693,
    imageUrl:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
    tags: ["감성숙소", "도담삼봉 근처"],
    aiSummary:
      "도담삼봉 등 단양 명소 접근성이 좋고 감성적인 인테리어가 호평을 받고 있습니다. 커플·소규모 여행에 적합합니다.",
    positiveTags: ["감성 인테리어", "명소 접근성", "조용한 환경"],
    cautionTags: ["주변 편의시설 부족"],
    reviews: [
      {
        author: "서**",
        rating: 5,
        content: "도담삼봉 걸어서 10분 거리라 너무 좋았어요.",
        writtenAt: "2024-11",
      },
      {
        author: "한**",
        rating: 4,
        content: "감성 있는 숙소였어요. 커플 여행으로 완벽했습니다.",
        writtenAt: "2024-10",
      },
      {
        author: "신**",
        rating: 5,
        content: "조용하고 깨끗해요. 단양 여행 베이스캠프로 최고였습니다.",
        writtenAt: "2024-09",
      },
      {
        author: "권**",
        rating: 4,
        content: "인테리어가 진짜 예뻐요. 사진 잘 나오는 공간들이 많았어요.",
        writtenAt: "2024-08",
      },
      {
        author: "황**",
        rating: 3,
        content: "숙소 자체는 좋은데 근처에 편의점이 없어서 불편했어요.",
        writtenAt: "2024-07",
      },
    ],
  },
  {
    id: 4,
    name: "충주 호암지 한옥 스테이",
    area: "충주",
    address: "충청북도 충주시 호암동 456",
    priceFrom: 112000,
    rating: 4.5,
    reviewCount: 521,
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
    tags: ["한옥", "전통숙소"],
    aiSummary:
      "전통 한옥의 고즈넉한 분위기와 현대적 편의시설이 조화롭게 갖춰져 있습니다. 한국 전통문화 체험을 원하는 여행자에게 적합합니다.",
    positiveTags: ["한옥 분위기", "전통 체험", "조용한 위치"],
    cautionTags: ["난방 다소 불편", "주차 협소"],
    reviews: [
      {
        author: "류**",
        rating: 5,
        content:
          "한옥 분위기가 정말 좋아요. 아침에 마당에서 차 한 잔 마시는 게 최고였어요.",
        writtenAt: "2024-11",
      },
      {
        author: "노**",
        rating: 4,
        content: "전통 한옥 체험하고 싶으면 여기 강추해요.",
        writtenAt: "2024-10",
      },
      {
        author: "문**",
        rating: 5,
        content: "호암지 바로 근처라 산책하기도 좋았어요.",
        writtenAt: "2024-09",
      },
      {
        author: "심**",
        rating: 4,
        content:
          "방 인테리어가 너무 예뻐요. 겨울엔 난방이 조금 부족한 느낌이었어요.",
        writtenAt: "2024-08",
      },
      {
        author: "안**",
        rating: 4,
        content: "주인분이 친절하시고 조식도 맛있었어요.",
        writtenAt: "2024-07",
      },
    ],
  },
];

export const getLodgings = async ({ area } = {}) => {
  // 실제 API: return await fetch(`/api/lodgings?area=${area}`).then(r => r.json());
  await new Promise((r) => setTimeout(r, 400));
  if (area && area !== "전체")
    return DUMMY_LODGINGS.filter((l) => l.area === area);
  return DUMMY_LODGINGS;
};

export const getLodgingById = async (id) => {
  // 실제 API: return await fetch(`/api/lodgings/${id}`).then(r => r.json());
  await new Promise((r) => setTimeout(r, 600));
  return DUMMY_LODGINGS.find((l) => l.id === id) ?? null;
};

export const sendChatMessage = async (question) => {
  // 실제 API:
  // return await fetch("/api/chatbot", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ question, context: { service: "Chungbuk Travel" } }),
  // }).then(r => r.json());
  await new Promise((r) => setTimeout(r, 1000));
  if (question.includes("단양"))
    return {
      answer:
        "단양에는 도담삼봉, 만천하스카이워크, 패러글라이딩이 유명해요. 감성 스테이를 추천드립니다.",
      sources: ["단양 관광지 데이터", "Tripadvisor 리뷰"],
    };
  if (question.includes("제천"))
    return {
      answer:
        "제천은 청풍호 케이블카와 의림지가 대표 명소예요. 청풍호 리조트를 추천드립니다.",
      sources: ["제천 관광지 데이터", "Tripadvisor 리뷰"],
    };
  if (question.includes("숙소") || question.includes("숙박"))
    return {
      answer:
        "청주 도심 호텔, 제천 청풍호 리조트, 단양 감성 스테이, 충주 한옥 스테이가 있어요. 지역을 알려주시면 더 자세히 추천해 드릴게요.",
      sources: ["충북 숙박 데이터"],
    };
  return {
    answer: "충북 여행지, 숙소, 맛집, 체험 코스에 대해 질문해 주세요.",
    sources: ["충북 관광 데이터"],
  };
};
