import { createServerClient } from '@/services/supabase-server'
import { successResponse, errorResponse } from '@/utils/api-response'
import type { CreateComputerInput } from '@power-station/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('computers')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return errorResponse('DB_ERROR', error.message, 500)
  }

  return successResponse(data)
}

export async function POST(request: Request) {
  let body: CreateComputerInput

  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_JSON', 'Request body must be valid JSON')
  }

  const { name, mac_address, broadcast_address = '255.255.255.255' } = body

  if (!name?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'name is required')
  }

  if (!mac_address?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'mac_address is required')
  }

  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  if (!macRegex.test(mac_address)) {
    return errorResponse(
      'VALIDATION_ERROR',
      'mac_address must be in format XX:XX:XX:XX:XX:XX',
    )
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('computers')
    .insert({ name: name.trim(), mac_address, broadcast_address })
    .select()
    .single()

  if (error) {
    return errorResponse('DB_ERROR', error.message, 500)
  }

  return successResponse(data, 201)
}
