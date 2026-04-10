interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="eyebrow">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-normal sm:text-2xl" style={{ fontFamily: 'var(--font-title), serif' }}>
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-[1.9]" style={{ color: 'var(--text-dim)' }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
