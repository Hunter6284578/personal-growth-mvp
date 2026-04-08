import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="public-shell flex min-h-screen items-center justify-center px-4">
      <div className="public-section max-w-xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-950">这个页面不存在。</h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          可能是链接已经变更，或者这部分内容还没有公开。
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
