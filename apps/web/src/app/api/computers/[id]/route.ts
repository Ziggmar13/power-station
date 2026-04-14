import { createServerClient } from '@/services/supabase-server'
import { successResponse, errorResponse } from '@/utils/api-response'
import type { UpdateComputerInput } from '@/types'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/computers/[id]'>,
) {
  const { id } = await ctx.params
  let body: UpdateComputerInput

  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_JSON', 'Request body must be valid JSON')
  }

  const updates: UpdateComputerInput = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.mac_address !== undefined) updates.mac_address = body.mac_address
  if (body.broadcast_address !== undefined)
    updates.broadcast_address = body.broadcast_address

  if (updates.mac_address) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    if (!macRegex.test(updates.mac_address)) {
      return errorResponse(
        'VALIDATION_ERROR',
        'mac_address must be in format XX:XX:XX:XX:XX:XX',
      )
    }
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('computers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return errorResponse('DB_ERROR', error.message, 500)
  }

  return successResponse(data)
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/computers/[id]'>,
) {
  const { id } = await ctx.params
  const supabase = createServerClient()
  const { error } = await supabase.from('computers').delete().eq('id', id)

  if (error) {
    return errorResponse('DB_ERROR', error.message, 500)
  }

  return successResponse({ id })
}
