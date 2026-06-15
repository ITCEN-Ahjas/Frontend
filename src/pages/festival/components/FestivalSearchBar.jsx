export default function FestivalSearchBar({ keyword, onKeywordChange, onSearch }) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition focus-within:border-chungbuk-purple focus-within:ring-4 focus-within:ring-purple-100">
        <svg
          className="h-5 w-5 shrink-0 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={event => onKeywordChange(event.target.value)}
          placeholder="축제, 체험, 지역 또는 키워드를 검색하세요"
          className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="h-[52px] shrink-0 rounded-2xl bg-chungbuk-dark-blue px-7 text-sm font-black text-white shadow-sm transition hover:bg-chungbuk-purple"
      >
        검색
      </button>
    </div>
  );
}
