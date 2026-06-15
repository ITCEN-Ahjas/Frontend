function getBadgeClass(variant) {
  if (variant === 'status') {
    return 'bg-chungbuk-purple';
  }

  if (variant === 'category') {
    return 'bg-chungbuk-cyan';
  }

  return 'bg-chungbuk-dark-blue';
}

export default function Card({
  imageUrl,
  imageAlt,
  fallbackText = 'CHUNGBUK TRAVEL',
  badges = [],
  title,
  subtitle,
  description,
  metaItems = [],
  actionLabel = '상세보기',
  onAction,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt ?? title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chungbuk-purple to-chungbuk-cyan px-[1.5rem] text-center text-xs font-black tracking-[0.35em] text-white">
            {fallbackText}
          </div>
        )}

        {badges.length > 0 && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={`${badge.label}-${index}`}
                className={`rounded-full px-[1rem] py-[0.7rem] text-xs font-black text-white shadow-sm ${getBadgeClass(badge.variant)}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        {subtitle && <p className="text-sm font-black text-slate-500">{subtitle}</p>}

        {title && (
          <h3 className="text-[2rem] font-black leading-tight tracking-[-0.04em] text-slate-950">
            {title}
          </h3>
        )}

        {description && (
          <p className="min-h-[4.8rem] text-sm font-medium leading-7 text-slate-600">
            {description}
          </p>
        )}

        {metaItems.length > 0 && (
          <div className="space-y-3 text-sm text-slate-600">
            {metaItems.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3"
              >
                <span className="font-black text-slate-500">{item.label}</span>
                <span className="font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="mt-auto flex h-[4.4rem] items-center justify-center gap-2 rounded-[1.5rem] bg-chungbuk-dark-blue px-6 text-sm font-black text-white transition hover:bg-chungbuk-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-chungbuk-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {actionLabel}
            <span>›</span>
          </button>
        )}
      </div>
    </article>
  );
}
