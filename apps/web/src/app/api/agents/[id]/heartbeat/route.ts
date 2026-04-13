import { createServerClient } from '@/services/supabase-server'
import { successResponse, errorResponse } from '@/utils/api-response'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/agents/[id]/heartbeat'>,
) {
  const { id } = await ctx.params
  const supabase = createServerClient()

  const { error } = await supabase.from('agents').upsert(
    { computer_id: id, last_seen: new Date().toISOString() },
    { onConflict: 'computer_id' },
  )

  if (error) {
    return errorResponse('DB_ERROR', error.message, 500)
  }

  return successResponse({ ok: true })
}
