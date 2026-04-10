export function logInfo(message: string, context?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level: 'info',
      message,
      context: context ?? {},
      timestamp: new Date().toISOString(),
    })
  )
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  console.error(
    JSON.stringify({
      level: 'error',
      message,
      stack,
      context: context ?? {},
      timestamp: new Date().toISOString(),
    })
  )
}
