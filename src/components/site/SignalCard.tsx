interface SignalCardProps {
  label: string
  value: string
}

export function SignalCard({ label, value }: SignalCardProps) {
  return (
    <div className="content-card">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="mt-3 text-lg font-semibold" style={{ color: 'var(--text-bright)' }}>{value}</p>
    </div>
  )
}
