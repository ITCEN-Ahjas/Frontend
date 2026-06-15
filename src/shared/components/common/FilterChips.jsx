function getActiveClass(activeVariant) {
  if (activeVariant === 'cyan') {
    return 'border-chungbuk-cyan bg-chungbuk-cyan text-white';
  }

  if (activeVariant === 'dark') {
    return 'border-chungbuk-dark-blue bg-chungbuk-dark-blue text-white';
  }

  return 'border-chungbuk-purple bg-chungbuk-purple text-white';
}

export default function FilterChips({
  label,
  options,
  selectedValue,
  onChange,
  activeVariant = 'purple',
}) {
  const activeClass = getActiveClass(activeVariant);

  return (
    <div className="flex flex-wrap items-center gap-[1.2rem]">
      <span className="w-[7rem] shrink-0 text-sm font-black text-slate-950">{label}</span>
      <div className="flex flex-1 flex-wrap gap-[1.2rem]">
        {options.map(option => {
          const active = selectedValue === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange?.(option)}
              className={`rounded-full border px-[1.8rem] py-[0.9rem] text-[1.4rem] font-black shadow-sm transition focus:outline-none ${
                active
                  ? activeClass
                  : 'border-slate-200 bg-white text-slate-500 hover:border-chungbuk-purple hover:text-chungbuk-purple'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
