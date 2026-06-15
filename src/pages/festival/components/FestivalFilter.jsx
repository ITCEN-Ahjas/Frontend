const REGIONS = ['전체', '청주', '충주', '제천', '단양', '보은', '영동'];
const CATEGORIES = ['전체', '문화축제', '먹거리', '자연체험', '액티비티', '야간행사', '전통시장'];

export default function FestivalFilter({
  selectedRegion,
  selectedCategory,
  onRegionChange,
  onCategoryChange,
  onReset,
}) {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-20 shrink-0 text-sm font-black text-slate-950">지역</span>
        <div className="flex flex-1 flex-wrap gap-3">
          {REGIONS.map(region => {
            const active = selectedRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => onRegionChange(region)}
                className={`rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-500 shadow-sm transition hover:border-chungbuk-purple hover:text-chungbuk-purple ${
                  active ? 'border-chungbuk-purple bg-chungbuk-purple text-white shadow-md' : ''
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="w-20 shrink-0 text-sm font-black text-slate-950">카테고리</span>
        <div className="flex flex-1 flex-wrap gap-3">
          {CATEGORIES.map(category => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-500 shadow-sm transition hover:border-chungbuk-purple hover:text-chungbuk-purple ${
                  active ? 'border-chungbuk-cyan bg-chungbuk-cyan text-white shadow-md' : ''
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-500 shadow-sm transition hover:border-chungbuk-purple hover:text-chungbuk-purple sm:w-auto sm:ml-auto"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
