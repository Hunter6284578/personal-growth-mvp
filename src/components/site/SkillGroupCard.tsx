interface SkillGroupCardProps {
  title: string
  items: string[]
  countLabel: string
}

export function SkillGroupCard({ title, items, countLabel }: SkillGroupCardProps) {
  return (
    <div className="content-card">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-bright)' }}>{title}</h3>
        <span className="tag-minimal">
          {items.length} {countLabel}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <span
            key={item}
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
