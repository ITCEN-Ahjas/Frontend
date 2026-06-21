export const CHUNGBUK_REGIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'CHEONGJU', label: '청주시' },
  { value: 'CHUNGJU', label: '충주시' },
  { value: 'JECHEON', label: '제천시' },
  { value: 'BOEUN', label: '보은군' },
  { value: 'OKCHEON', label: '옥천군' },
  { value: 'YEONGDONG', label: '영동군' },
  { value: 'JEUNGPYEONG', label: '증평군' },
  { value: 'JINCHEON', label: '진천군' },
  { value: 'GOESAN', label: '괴산군' },
  { value: 'EUMSEONG', label: '음성군' },
  { value: 'DANYANG', label: '단양군' },
];

export function getChungbukRegionLabel(regionValue) {
  return CHUNGBUK_REGIONS.find(region => region.value === regionValue)?.label || '';
}
