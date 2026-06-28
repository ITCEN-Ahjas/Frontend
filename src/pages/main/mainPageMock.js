export const mainFeatureCards = [
  {
    id: 'course',
    label: 'AI 코스 추천',
    title: '날씨와 취향에 맞는 여행 코스',
    description: '식사, 관광, 이동 흐름을 고려해 충북 여행 코스를 추천합니다.',
    href: '/course',
    imageUrl: '',
  },
  {
    id: 'map',
    label: '지도 검색',
    title: '충북 장소를 지도에서 찾기',
    description: '지역, 카테고리, 키워드로 관광지와 편의 장소를 탐색합니다.',
    href: '/map',
    imageUrl: '',
  },
  {
    id: 'festival',
    label: '축제와 체험',
    title: '지금 즐길 수 있는 충북 콘텐츠',
    description: '충북의 축제, 체험, 관광 콘텐츠를 한 번에 확인합니다.',
    href: '/festival',
    imageUrl: '',
  },
  {
    id: 'lodging',
    label: '숙박',
    title: '여행 일정에 맞는 숙소 찾기',
    description: '충북 지역 숙박 정보를 확인하고 상세 위치를 볼 수 있습니다.',
    href: '/lodging',
    imageUrl: '',
  },
];

export const mainPopularRegions = [
  {
    id: 'cheongju',
    name: '청주',
    description: '도심 관광, 문화 공간, 음식점을 함께 둘러보기 좋은 지역입니다.',
    href: '/map?region=CHEONGJU',
    imageUrl: '',
    placeCount: 42,
  },
  {
    id: 'chungju',
    name: '충주',
    description: '호수와 체험 여행을 함께 계획하기 좋은 지역입니다.',
    href: '/map?region=CHUNGJU',
    imageUrl: '',
    placeCount: 31,
  },
  {
    id: 'danyang',
    name: '단양',
    description: '자연 경관과 액티비티 중심 여행에 적합한 지역입니다.',
    href: '/map?region=DANYANG',
    imageUrl: '',
    placeCount: 28,
  },
];

export const mainSearchKeywords = [
  {
    id: 'rainy-day',
    label: '비 오는 날',
    keyword: '실내 관광',
    href: '/map?keyword=%EC%8B%A4%EB%82%B4%20%EA%B4%80%EA%B4%91',
  },
  {
    id: 'family',
    label: '가족 여행',
    keyword: '체험',
    href: '/festival?keyword=%EC%B2%B4%ED%97%98',
  },
  {
    id: 'food',
    label: '맛집',
    keyword: '음식점',
    href: '/map?category=RESTAURANT',
  },
  {
    id: 'stay',
    label: '숙소',
    keyword: '숙박',
    href: '/lodging',
  },
];

export const mainTodayStats = [
  {
    id: 'festivals',
    label: '진행 중 축제',
    value: 8,
    unit: '개',
    href: '/festival',
  },
  {
    id: 'places',
    label: '추천 장소',
    value: 128,
    unit: '곳',
    href: '/map',
  },
  {
    id: 'lodgings',
    label: '숙박 정보',
    value: 56,
    unit: '곳',
    href: '/lodging',
  },
];

export const mainWeatherCards = [
  {
    id: 'cheongju-weather',
    region: '청주',
    temperature: '24°C',
    condition: '구름 많음',
    recommendation: '가벼운 겉옷과 실내 관광지를 함께 준비하세요.',
    href: '/clothing',
  },
  {
    id: 'chungju-weather',
    region: '충주',
    temperature: '23°C',
    condition: '흐림',
    recommendation: '호수 주변 산책은 바람을 고려해 계획하세요.',
    href: '/clothing',
  },
];
