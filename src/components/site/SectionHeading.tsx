interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div>
      {eyebrow ? (
        <p className="eyebrow">{eyebrow}</p>
      ) : null}
      <h2
        className="mt-2 text-xl font-normal sm:text-[1.375rem]"
        style={{
          fontFamily: 'var(--font-title), serif',
          color: 'var(--text-bright)',
          lineHeight: 1.55,
        }}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-[1.9]" style={{ color: 'var(--text-dim)' }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
