import { request as httpsRequest } from 'node:https'
import dns from 'node:dns/promises'

const DNS_SERVERS = ['1.1.1.1', '8.8.8.8']
const REQUEST_TIMEOUT_MS = 8000
const cache = new Map<string, { address: string; expiresAt: number }>()

const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'cookie',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'set-cookie',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

async function resolveWithPublicDns(hostname: string) {
  const cached = cache.get(hostname)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.address
  }

  dns.setServers(DNS_SERVERS)
  const addresses = await dns.resolve4(hostname)
  const address = addresses[0]

  if (!address) {
    throw new Error(`No IPv4 address found for ${hostname}`)
  }

  cache.set(hostname, {
    address,
    expiresAt: Date.now() + 5 * 60 * 1000,
  })

  return address
}

function headersToObject(headers: Headers) {
  const result: Record<string, string> = {}

  headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      result[key] = value
    }
  })

  return result
}

function responseHeadersToHeaders(headers: Record<string, string | string[] | undefined>) {
  const result = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (!value || hopByHopHeaders.has(key.toLowerCase())) continue

    if (Array.isArray(value)) {
      for (const item of value) {
        result.append(key, item)
      }
    } else {
      result.set(key, value)
    }
  }

  return result
}

export async function fetchViaPublicDns(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init)
  const url = new URL(request.url)

  if (url.protocol !== 'https:') {
    return fetch(request)
  }

  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : Buffer.from(await request.arrayBuffer())

  return new Promise<Response>((resolve, reject) => {
    const req = httpsRequest(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: request.method,
        headers: headersToObject(request.headers),
        lookup(hostname, options, callback) {
          resolveWithPublicDns(hostname)
            .then((address) => {
              if (typeof options === 'object' && options?.all) {
                callback(null, [{ address, family: 4 }])
              } else {
                callback(null, address, 4)
              }
            })
            .catch((error) => {
              (callback as (err: Error) => void)(error)
            })
        },
      },
      (res) => {
        const chunks: Buffer[] = []

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })

        res.on('end', () => {
          resolve(new Response(Buffer.concat(chunks), {
            status: res.statusCode ?? 500,
            statusText: res.statusMessage,
            headers: responseHeadersToHeaders(res.headers),
          }))
        })
      },
    )

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Supabase request timed out after ${REQUEST_TIMEOUT_MS}ms`))
    })

    req.on('error', reject)

    if (body) {
      req.write(body)
    }

    req.end()
  })
}
