import {
  FiCloud,
  FiMap,
  FiMessageCircle,
  FiNavigation,
} from 'react-icons/fi';

export const CHUNGBUK_CENTER = {
  lat: 36.6357,
  lng: 127.4917,
};

export const REGION_OPTIONS = [
  '청주',
  '충주',
  '제천',
  '보은',
  '옥천',
  '영동',
  '증평',
  '진천',
  '괴산',
  '음성',
  '단양',
];

export const INTEREST_OPTIONS = [
  { value: 'nature', label: '자연' },
  { value: 'history', label: '역사' },
  { value: 'culture', label: '문화' },
  { value: 'food', label: '맛집' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'healing', label: '힐링' },
];

export const SELECT_OPTIONS = {
  companionType: [
    { value: 'solo', label: '혼자' },
    { value: 'couple', label: '연인' },
    { value: 'family', label: '가족' },
    { value: 'friends', label: '친구' },
  ],
  budget: [
    { value: 'low', label: '절약' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '여유' },
  ],
  activityIntensity: [
    { value: 'low', label: '여유롭게' },
    { value: 'medium', label: '적당히' },
    { value: 'high', label: '활동적으로' },
  ],
  transportMode: [
    { value: 'walk', label: '도보' },
    { value: 'publicTransit', label: '대중교통' },
    { value: 'car', label: '차량' },
  ],
};

export const TAB_ITEMS = [
  { id: 'summary', label: '여행 요약', icon: FiMap },
  { id: 'itinerary', label: '세부 일정', icon: FiNavigation },
  { id: 'articles', label: '연관 기사', icon: FiCloud },
  { id: 'talk', label: '여행톡', icon: FiMessageCircle },
];

export const INITIAL_FORM = {
  region: '청주',
  interests: ['nature'],
  companionType: 'friends',
  budget: 'medium',
  activityIntensity: 'medium',
  transportMode: 'car',
  travelDate: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '18:00',
  startLocation: '청주 시외버스터미널',
  endLocation: '청주 시외버스터미널',
};
