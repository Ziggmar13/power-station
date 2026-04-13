import { verifyAlexaRequest } from '@/utils/alexa-verifier'
import { handleAlexaRequest } from '@/services/alexa-handler'
import { errorResponse } from '@/utils/api-response'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Read raw body as Buffer BEFORE JSON parsing — required for signature verification
  const arrayBuffer = await request.arrayBuffer()
  const rawBody = Buffer.from(arrayBuffer)

  const skipVerify = process.env.SKIP_ALEXA_VERIFY === 'true'

  if (!skipVerify) {
    try {
      await verifyAlexaRequest(request, rawBody)
    } catch {
      return errorResponse('ALEXA_SIGNATURE_INVALID', 'Request signature is invalid', 400)
    }
  }

  let envelope: object
  try {
    envelope = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return errorResponse('INVALID_JSON', 'Request body must be valid JSON')
  }

  const alexaResponse = await handleAlexaRequest(
    envelope as Parameters<typeof handleAlexaRequest>[0],
  )

  return new Response(JSON.stringify(alexaResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
