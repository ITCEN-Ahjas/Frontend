import FilterChips from '../../../shared/components/common/FilterChips';
import SearchBar from '../../../shared/components/common/SearchBar';

const REGIONS = ['전체', '청주', '충주', '제천', '단양', '보은', '영동'];
const CATEGORIES = ['전체', '문화축제', '먹거리', '자연체험', '액티비티', '야간행사', '전통시장'];

export default function FestivalFilterPanel({
  keyword,
  selectedRegion,
  selectedCategory,
  onKeywordChange,
  onSearch,
  onRegionChange,
  onCategoryChange,
  onReset,
}) {
  return (
    <section className="mt-[2.5rem] rounded-[2.5rem] bg-white p-[1.5rem] shadow-[0_1.8rem_5rem_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <SearchBar
          value={keyword}
          placeholder="축제, 체험, 지역 또는 키워드를 검색하세요"
          onChange={onKeywordChange}
          onSearch={onSearch}
        />

        <button
          type="button"
          onClick={onReset}
          className="h-[3.25rem] shrink-0 rounded-[1.25rem] border border-slate-200 bg-white px-[1.5rem] text-sm font-black text-slate-500 shadow-sm transition hover:border-chungbuk-purple hover:text-chungbuk-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-chungbuk-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          초기화
        </button>
      </div>

      <div className="mt-[1.4rem] space-y-[1rem]">
        <FilterChips
          label="지역"
          options={REGIONS}
          selectedValue={selectedRegion}
          onChange={onRegionChange}
          activeVariant="purple"
        />
        <FilterChips
          label="카테고리"
          options={CATEGORIES}
          selectedValue={selectedCategory}
          onChange={onCategoryChange}
          activeVariant="cyan"
        />
      </div>
    </section>
  );
}
