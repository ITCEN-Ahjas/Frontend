export default function PageHero({ eyebrow, title, description, subDescription }) {
  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-[70rem]">
        {eyebrow && (
          <p className="mb-4 inline-flex rounded-full bg-chungbuk-purple/10 px-6 py-3 text-sm font-black text-chungbuk-purple">
            {eyebrow}
          </p>
        )}

        <h1 className="text-[3.6rem] font-black tracking-[-0.06em] text-slate-950 sm:text-[4.8rem]">
          {title}
        </h1>

        {description && (
          <p className="mt-6 text-[1.8rem] font-semibold leading-[2.6rem] text-slate-600">
            {description}
          </p>
        )}

        {subDescription && (
          <p className="mt-4 text-[1.4rem] font-medium text-slate-400">{subDescription}</p>
        )}
      </div>

      <div className="flex h-[13rem] min-h-[13rem] max-w-[46rem] flex-1 rounded-bl-[12rem] rounded-tl-[24rem] bg-gradient-to-br from-chungbuk-purple/10 via-chungbuk-cyan/10 to-white" />
    </section>
  );
}
