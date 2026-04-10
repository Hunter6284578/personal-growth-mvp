interface SkillGroupCardProps {
  title: string
  items: string[]
  countLabel: string
}

export function SkillGroupCard({ title, items, countLabel }: SkillGroupCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.8)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
          {items.length} {countLabel}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

