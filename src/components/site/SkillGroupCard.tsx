interface SkillGroupCardProps {
  title: string
  items: string[]
}

export function SkillGroupCard({ title, items }: SkillGroupCardProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-[0_18px_50px_-28px_rgba(24,24,27,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          {items.length} 项
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
