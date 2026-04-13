import wol from 'wake_on_lan'
import { logger } from '../utils/logger'

export function sendWolPacket(
  macAddress: string,
  broadcastAddress = '255.255.255.255',
): Promise<void> {
  return new Promise((resolve, reject) => {
    wol.wake(macAddress, { address: broadcastAddress }, (err: Error | null) => {
      if (err) {
        logger.error(`WoL failed for ${macAddress}:`, err)
        reject(err)
      } else {
        logger.info(`WoL packet sent to ${macAddress} via ${broadcastAddress}`)
        resolve()
      }
    })
  })
}
