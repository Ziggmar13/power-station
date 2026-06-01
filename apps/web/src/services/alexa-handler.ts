import { createServerClient } from './supabase-server'
import { INTENTS } from '@/constants/intents'

interface AlexaSlot {
  name: string
  value?: string
  resolutions?: unknown
}

interface AlexaIntent {
  name: string
  confirmationStatus: string
  slots?: Record<string, AlexaSlot>
}

interface AlexaRequest {
  type: string
  requestId: string
  timestamp: string
  intent?: AlexaIntent
}

interface AlexaRequestEnvelope {
  version: string
  request: AlexaRequest
}

function buildSpeechResponse(speechText: string, shouldEndSession = true) {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: speechText,
      },
      shouldEndSession,
    },
  }
}

export async function handleAlexaRequest(
  envelope: AlexaRequestEnvelope,
): Promise<object> {
  const { type } = envelope.request

  if (type === 'LaunchRequest') {
    return buildSpeechResponse(
      'Power Station is ready. You can say: turn on my PC, or turn off my PC.',
      false,
    )
  }

  if (type === 'SessionEndedRequest') {
    return { version: '1.0', response: {} }
  }

  if (type !== 'IntentRequest' || !envelope.request.intent) {
    return buildSpeechResponse('Sorry, I did not understand that request.')
  }

  const { name: intentName, slots } = envelope.request.intent

  if (intentName === INTENTS.HELP) {
    return buildSpeechResponse(
      'You can say: turn on my PC, wake up my PC, turn off my PC, or shut down my PC.',
      false,
    )
  }

  if (intentName === INTENTS.STOP || intentName === INTENTS.CANCEL) {
    return buildSpeechResponse('Goodbye!')
  }

  if (intentName === INTENTS.TURN_ON || intentName === INTENTS.TURN_OFF) {
    const action = intentName === INTENTS.TURN_ON ? 'wake' : 'shutdown'
    const rawSlot = slots?.ComputerName?.value?.toLowerCase().trim()
    const FILLER_PHRASES = new Set(['my pc', 'my computer', 'my machine', 'pc', 'computer', 'machine'])
    const computerNameSlot = rawSlot && !FILLER_PHRASES.has(rawSlot) ? rawSlot : undefined

    const supabase = createServerClient()

    let computer: { id: string; name: string } | null = null

    if (computerNameSlot) {
      const { data } = await supabase
        .from('computers')
        .select('id, name')
        .ilike('name', `%${computerNameSlot}%`)
        .limit(1)
      computer = data?.[0] ?? null
    }

    if (!computer) {
      const { data } = await supabase
        .from('computers')
        .select('id, name')
        .order('created_at', { ascending: true })
        .limit(1)
      computer = data?.[0] ?? null
    }

    if (!computer) {
      return buildSpeechResponse(
        'No computers are registered. Please add one in the Power Station dashboard first.',
      )
    }

    const { error: cmdError } = await supabase.from('commands').insert({
      computer_id: computer.id,
      action,
      status: 'pending',
    })

    if (cmdError) {
      return buildSpeechResponse(
        'Sorry, there was a problem sending the command. Please try again.',
      )
    }

    const speechText =
      action === 'wake'
        ? `Waking up ${computer.name}.`
        : `Shutting down ${computer.name}.`

    return buildSpeechResponse(speechText)
  }

  return buildSpeechResponse('Sorry, I did not understand that request.')
}
