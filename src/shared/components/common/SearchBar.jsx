export default function SearchBar({ value, placeholder, onChange, onSearch }) {
  const handleSubmit = event => {
    event.preventDefault();
    onSearch?.();
  };

  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={handleSubmit}
    >
      <div className="flex h-[3.25rem] w-full items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-[1.25rem] shadow-sm transition focus-within:border-chungbuk-purple focus-within:ring-4 focus-within:ring-purple-100">
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
          value={value}
          onChange={event => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[1.4rem] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        type="submit"
        className="h-[3.25rem] shrink-0 rounded-[1.25rem] bg-chungbuk-dark-blue px-[1.75rem] text-sm font-black text-white shadow-sm transition hover:bg-chungbuk-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-chungbuk-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        검색
      </button>
    </form>
  );
}
