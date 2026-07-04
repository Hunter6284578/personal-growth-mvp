import { NextResponse } from 'next/server'

// CSP 违规上报端点。
// 浏览器在 CSP 违规时会以 application/csp-report 或 application/reports+json
// 发送 POST 请求，body 形如：
//   { "csp-report": { "document-uri": "...", "violated-directive": "...",
//                     "blocked-uri": "...", "source-file": "..." } }
//
// 这里只做轻量记录：把原始 body 打到服务器日志，便于事后排查。
// 端点不持久化、不做任何校验，避免被攻击者刷日志。
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const report = await request.text()
    // 控制台一行摘要，避免 PII 泄漏到日志系统
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[csp-report]', report.slice(0, 500))
    } else {
      // 生产环境只输出受控字段
      try {
        const parsed = JSON.parse(report) as Record<string, unknown>
        const inner = (parsed['csp-report'] ?? parsed) as Record<string, unknown>
        console.warn('[csp-report]', {
          directive: inner['violated-directive'],
          blocked: inner['blocked-uri'],
          document: inner['document-uri'],
        })
      } catch {
        // 静默忽略格式异常的 report
      }
    }
  } catch {
    // 上报端点失败不应让浏览器感知，吞掉所有异常
  }

  // CSP 规范要求上报端点返回 2xx
  return new NextResponse(null, { status: 204 })
}

// 部分浏览器 / 代理会对 POST 失败的端点预检，发 OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'self',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
