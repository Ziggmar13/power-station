import crypto from 'crypto'
import { URL } from 'url'

const TIMESTAMP_TOLERANCE_SECONDS = 150
const ALEXA_CERT_SUBJECT = 'echo-api.amazon.com'
const certCache = new Map<string, { pem: string; leaf: crypto.X509Certificate }>()

function validateCertUri(certUrl: string): void {
  const u = new URL(certUrl)
  if (u.protocol !== 'https:') throw new Error('cert url must be https')
  if (u.hostname.toLowerCase() !== 's3.amazonaws.com')
    throw new Error('cert url host must be s3.amazonaws.com')
  if (!u.pathname.startsWith('/echo.api/'))
    throw new Error('cert url path must start with /echo.api/')
  if (u.port && u.port !== '443') throw new Error('cert url port must be 443')
}

function extractLeafPem(chainPem: string): string {
  const match = chainPem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)
  if (!match) throw new Error('no certificate in PEM chain')
  return match[0]
}

async function fetchCert(certUrl: string): Promise<{ pem: string; leaf: crypto.X509Certificate }> {
  const cached = certCache.get(certUrl)
  if (cached) return cached

  const res = await fetch(certUrl)
  if (!res.ok) throw new Error(`cert fetch ${res.status}`)
  const pem = await res.text()
  const leaf = new crypto.X509Certificate(extractLeafPem(pem))

  const now = Date.now()
  if (now < new Date(leaf.validFrom).getTime()) throw new Error('cert not yet valid')
  if (now > new Date(leaf.validTo).getTime()) throw new Error('cert expired')
  if (!leaf.checkHost(ALEXA_CERT_SUBJECT)) throw new Error('cert subject does not match echo-api.amazon.com')

  const entry = { pem, leaf }
  certCache.set(certUrl, entry)
  return entry
}

function validateTimestamp(body: Buffer): void {
  const parsed = JSON.parse(body.toString('utf8'))
  const ts = parsed?.request?.timestamp
  if (!ts) throw new Error('missing request timestamp')
  const driftSeconds = Math.abs(Date.now() - new Date(ts).getTime()) / 1000
  if (driftSeconds > TIMESTAMP_TOLERANCE_SECONDS) throw new Error('timestamp outside tolerance window')
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

  const { pem } = await fetchCert(certUrl)

  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(rawBody)
  if (!verifier.verify(pem, signature, 'base64')) throw new Error('signature verify failed')
}
