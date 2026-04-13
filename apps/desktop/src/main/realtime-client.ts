import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendWolPacket } from './wol-handler'
import { shutdownComputer } from './shutdown-handler'
import { updateTrayStatus } from './tray'
import { logger } from '../utils/logger'

interface ComputerRecord {
  id: string
  name: string
  mac_address: string
  broadcast_address: string
}

interface CommandRecord {
  id: string
  computer_id: string
  action: 'wake' | 'shutdown'
  status: string
}

let supabase: SupabaseClient | null = null
let computerName = 'Unknown'

async function updateCommandStatus(
  commandId: string,
  status: 'executed' | 'failed',
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('commands')
    .update({ status })
    .eq('id', commandId)

  if (error) {
    logger.error('Failed to update command status:', error)
  }
}

async function handleCommand(
  command: CommandRecord,
  broadcastAddress: string,
  macAddress: string,
): Promise<void> {
  logger.info(`Received command: ${command.action} for computer ${command.computer_id}`)

  try {
    if (command.action === 'wake') {
      await sendWolPacket(macAddress, broadcastAddress)
    } else if (command.action === 'shutdown') {
      await shutdownComputer()
    } else {
      logger.warn(`Unknown action: ${command.action}`)
      return
    }
    await updateCommandStatus(command.id, 'executed')
  } catch (err) {
    logger.error(`Command execution failed:`, err)
    await updateCommandStatus(command.id, 'failed')
  }
}

export async function startRealtimeClient(
  supabaseUrl: string,
  supabaseKey: string,
  computerId: string,
  appUrl: string,
): Promise<void> {
  supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch computer details
  const { data: computer, error } = await supabase
    .from('computers')
    .select('id, name, mac_address, broadcast_address')
    .eq('id', computerId)
    .single<ComputerRecord>()

  if (error || !computer) {
    logger.error('Computer not found in database. Check COMPUTER_ID in .env', error)
    throw new Error(`Computer with id ${computerId} not found`)
  }

  computerName = computer.name
  logger.info(`Starting agent for computer: ${computer.name} (${computer.mac_address})`)

  updateTrayStatus(computerName, false)

  // Subscribe to commands
  const channel = supabase
    .channel(`commands-${computerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'commands',
        filter: `computer_id=eq.${computerId}`,
      },
      async (payload) => {
        const command = payload.new as CommandRecord
        if (command.status !== 'pending') return
        await handleCommand(command, computer.broadcast_address, computer.mac_address)
      },
    )
    .subscribe((status) => {
      const connected = status === 'SUBSCRIBED'
      logger.info(`Realtime channel status: ${status}`)
      updateTrayStatus(computerName, connected)
    })

  // Heartbeat every 30 seconds
  const heartbeatInterval = setInterval(async () => {
    try {
      await fetch(`${appUrl}/api/agents/${computerId}/heartbeat`, {
        method: 'POST',
      })
    } catch (err) {
      logger.warn('Heartbeat failed:', err)
    }
  }, 30_000)

  // Return cleanup function via process exit handler
  process.on('exit', () => {
    clearInterval(heartbeatInterval)
    supabase?.removeChannel(channel)
  })
}
