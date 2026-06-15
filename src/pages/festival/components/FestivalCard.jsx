function getBadgeClass(variant) {
  if (variant === 'status') {
    return 'bg-chungbuk-purple';
  }

  if (variant === 'category') {
    return 'bg-chungbuk-cyan';
  }

  return 'bg-chungbuk-dark-blue';
}

function formatDate(dateString) {
  if (!dateString || dateString.length !== 8) {
    return dateString || '-';
  }

  return `${dateString.slice(0, 4)}.${dateString.slice(4, 6)}.${dateString.slice(6, 8)}`;
}

export default function FestivalCard({ festival, onClickDetail }) {
  const period = `${formatDate(festival.startDate)} - ${formatDate(festival.endDate)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-96 overflow-hidden bg-slate-100">
        <img
          src={festival.imageUrl}
          alt={festival.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black text-white shadow-sm ${getBadgeClass('status')}`}
          >
            {festival.status ?? '진행 중'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black text-white shadow-sm ${getBadgeClass('category')}`}
          >
            {festival.category ?? '카테고리'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-500">
          <span>{festival.region}</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-[2rem] font-black leading-tight tracking-[-0.04em] text-slate-950">
            {festival.title}
          </h3>
          <p className="min-h-[4.8rem] text-sm font-medium leading-7 text-slate-600">
            {festival.description}
          </p>
        </div>

        <div className="mt-auto space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3">
            <span className="font-black text-slate-500">기간</span>
            <span className="font-semibold text-slate-700">{period}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3">
            <span className="font-black text-slate-500">문의</span>
            <span className="font-semibold text-slate-700">{festival.tel ?? '-'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onClickDetail?.(festival.id)}
          className="mt-4 flex h-[4.4rem] items-center justify-center gap-2 rounded-3xl bg-chungbuk-dark-blue px-6 text-sm font-black text-white transition hover:bg-chungbuk-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-chungbuk-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          상세보기
          <span>›</span>
        </button>
      </div>
    </article>
  );
}
