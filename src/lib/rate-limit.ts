const windowMs = 60_000
const maxRequests = 30

type Counter = {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, Counter>()

export function getRequestKey(ip: string, scope: string) {
  return `${scope}:${ip}`
}

export function checkRateLimit(key: string) {
  const now = Date.now()
  const current = memoryStore.get(key)

  if (!current || now > current.resetAt) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  current.count += 1
  memoryStore.set(key, current)

  if (current.count > maxRequests) {
    return { limited: true, remaining: 0, resetAt: current.resetAt }
  }

  return { limited: false, remaining: maxRequests - current.count, resetAt: current.resetAt }
}
