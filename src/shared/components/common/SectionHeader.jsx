export default function SectionHeader({ eyebrow, title, rightText }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-black text-chungbuk-purple">{eyebrow}</p>}
        <h2 className="mt-2 text-[3rem] font-black tracking-[-0.04em] text-slate-950">{title}</h2>
      </div>
      {rightText && <div className="text-sm font-black text-chungbuk-dark-blue">{rightText}</div>}
    </div>
  );
}
