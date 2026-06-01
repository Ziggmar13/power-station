import crypto from 'crypto'
import { URL } from 'url'

const TIMESTAMP_TOLERANCE_SECONDS = 150
const certCache = new Map<string, string>()

function validateCertUri(certUrl: string): void {
  const u = new URL(certUrl)
  if (u.protocol !== 'https:') throw new Error('cert url must be https')
  if (u.hostname.toLowerCase() !== 's3.amazonaws.com')
    throw new Error('cert url host must be s3.amazonaws.com')
  if (!u.pathname.startsWith('/echo.api/'))
    throw new Error('cert url path must start with /echo.api/')
  if (u.port && u.port !== '443') throw new Error('cert url port must be 443')
}

async function fetchCert(certUrl: string): Promise<string> {
  const cached = certCache.get(certUrl)
  if (cached) return cached
  const res = await fetch(certUrl)
  if (!res.ok) throw new Error(`cert fetch ${res.status}`)
  const pem = await res.text()
  certCache.set(certUrl, pem)
  return pem
}

function validateTimestamp(body: Buffer): void {
  const parsed = JSON.parse(body.toString('utf8'))
  const ts = parsed?.request?.timestamp
  if (!ts) throw new Error('missing request timestamp')
  const age = (Date.now() - new Date(ts).getTime()) / 1000
  if (age > TIMESTAMP_TOLERANCE_SECONDS) throw new Error('timestamp too old')
}

export async function verifyAlexaRequest(
  request: Request,
  rawBody: Buffer,
): Promise<void> {
  const certUrl = request.headers.get('SignatureCertChainUrl') ?? ''
  const signature = request.headers.get('Signature') ?? ''
  if (!certUrl) throw new Error('missing cert url')
  if (!signature) throw new Error('missing signature')

  validateCertUri(certUrl)
  validateTimestamp(rawBody)

  const pem = await fetchCert(certUrl)

  const algorithms = ['RSA-SHA256', 'RSA-SHA1']
  for (const algo of algorithms) {
    const v = crypto.createVerify(algo)
    v.update(rawBody)
    if (v.verify(pem, signature, 'base64')) return
  }

  throw new Error('signature verify failed (tried SHA256 and SHA1)')
}
