import { exec } from 'child_process'
import { logger } from '../utils/logger'

export function shutdownComputer(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec('shutdown /s /t 0', (err) => {
      if (err) {
        logger.error('Shutdown command failed:', err)
        reject(err)
      } else {
        logger.info('Shutdown command issued successfully')
        resolve()
      }
    })
  })
}
