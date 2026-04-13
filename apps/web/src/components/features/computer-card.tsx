'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AgentStatusBadge } from './agent-status-badge'
import type { Computer } from '@power-station/types'

interface ComputerCardProps {
  computer: Computer
}

export function ComputerCard({ computer }: ComputerCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${computer.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/computers/${computer.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{computer.name}</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{computer.mac_address}</p>
        </div>
        <AgentStatusBadge computerId={computer.id} />
      </div>

      <div className="text-xs text-gray-400">
        Broadcast: {computer.broadcast_address}
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/computers?id=${computer.id}`)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          loading={deleting}
          className="text-red-600 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
