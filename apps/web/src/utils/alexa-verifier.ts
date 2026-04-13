// alexa-verifier does not ship its own types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const verifier = require('alexa-verifier') as (
  signatureCertChainUrl: string,
  signature: string,
  body: string,
) => Promise<void>

export async function verifyAlexaRequest(
  request: Request,
  rawBody: Buffer,
): Promise<void> {
  const signatureCertChainUrl = request.headers.get('SignatureCertChainUrl') ?? ''
  const signature = request.headers.get('Signature') ?? ''

  await verifier(signatureCertChainUrl, signature, rawBody.toString())
}
