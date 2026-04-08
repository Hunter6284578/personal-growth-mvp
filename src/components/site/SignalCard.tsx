interface SignalCardProps {
  label: string
  value: string
}

export function SignalCard({ label, value }: SignalCardProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/90 p-5 shadow-[0_18px_50px_-28px_rgba(24,24,27,0.28)]">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-3 text-lg font-semibold text-stone-950">{value}</p>
    </div>
  )
}
