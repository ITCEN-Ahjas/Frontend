export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const safeTotalPages = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotalPages }, (_, index) => index + 1);

  const movePage = page => {
    const nextPage = Math.min(Math.max(page, 1), safeTotalPages);
    onPageChange?.(nextPage);
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => movePage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-[1.4rem] font-black shadow-sm transition hover:border-chungbuk-purple hover:text-chungbuk-purple ${
          currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
        }`}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {pages.map(page => {
        const active = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => movePage(page)}
            className={`flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-[1.2rem] border text-[1.4rem] font-black shadow-sm transition ${
              active
                ? 'border-chungbuk-dark-blue bg-chungbuk-dark-blue text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-chungbuk-purple hover:text-chungbuk-purple'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => movePage(currentPage + 1)}
        disabled={currentPage >= safeTotalPages}
        className={`flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-[1.8rem] font-black shadow-sm transition ${
          currentPage >= safeTotalPages
            ? 'cursor-not-allowed text-slate-300 opacity-50'
            : 'text-slate-600 hover:border-chungbuk-purple hover:text-chungbuk-purple'
        }`}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </div>
  );
}
