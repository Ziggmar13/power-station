'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/services/supabase'
import { Badge } from '@/components/ui/badge'

interface AgentStatusBadgeProps {
  computerId: string
}

const ONLINE_THRESHOLD_MS = 60_000

export function AgentStatusBadge({ computerId }: AgentStatusBadgeProps) {
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    supabase
      .from('agents')
      .select('last_seen')
      .eq('computer_id', computerId)
      .single()
      .then(({ data }) => {
        if (data) setLastSeen(data.last_seen)
      })

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`agent-${computerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `computer_id=eq.${computerId}`,
        },
        (payload) => {
          const record = payload.new as { last_seen?: string }
          if (record?.last_seen) setLastSeen(record.last_seen)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [computerId])

  const isOnline =
    lastSeen !== null &&
    Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS

  if (lastSeen === null) return <Badge variant="gray">Unknown</Badge>
  return (
    <Badge variant={isOnline ? 'green' : 'red'}>
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  )
}
