'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Computer, CreateComputerInput, UpdateComputerInput } from '@/types'

interface ComputerFormProps {
  computer?: Computer
}

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

export function ComputerForm({ computer }: ComputerFormProps) {
  const router = useRouter()
  const isEditing = !!computer

  const [name, setName] = useState(computer?.name ?? '')
  const [macAddress, setMacAddress] = useState(computer?.mac_address ?? '')
  const [broadcastAddress, setBroadcastAddress] = useState(
    computer?.broadcast_address ?? '255.255.255.255',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Computer name is required'
    if (!macAddress.trim()) {
      newErrors.mac_address = 'MAC address is required'
    } else if (!MAC_REGEX.test(macAddress)) {
      newErrors.mac_address = 'Must be in format XX:XX:XX:XX:XX:XX'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError('')

    const url = isEditing
      ? `/api/computers/${computer.id}`
      : '/api/computers'

    const method = isEditing ? 'PATCH' : 'POST'
    const body: CreateComputerInput | UpdateComputerInput = {
      name: name.trim(),
      mac_address: macAddress,
      broadcast_address: broadcastAddress || '255.255.255.255',
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (!json.success) {
        setServerError(json.error?.message ?? 'Something went wrong')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Computer name"
        placeholder="e.g. Gaming PC"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="MAC address"
        placeholder="AA:BB:CC:DD:EE:FF"
        value={macAddress}
        onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
        error={errors.mac_address}
        hint="Find this in Windows: ipconfig /all → Physical Address"
        required
      />
      <Input
        label="Broadcast address"
        placeholder="255.255.255.255"
        value={broadcastAddress}
        onChange={(e) => setBroadcastAddress(e.target.value)}
        hint="Leave as 255.255.255.255 unless your network uses a different subnet"
      />

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading}>
          {isEditing ? 'Save changes' : 'Add computer'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
