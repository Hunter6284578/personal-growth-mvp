// proxy.ts 在 Next.js 16 上触发 "Response constructor: Invalid response status code 204" 内部 bug
// 当前没有真实功能需求，临时禁用
export function proxy() {
  return undefined
}

export const config = {
  matcher: [],
}
