import AutoLaunch from 'auto-launch'
import { logger } from '../utils/logger'

const autoLauncher = new AutoLaunch({
  name: 'Power Station',
  isHidden: true,
})

export async function enableAutoLaunch(): Promise<void> {
  try {
    const isEnabled = await autoLauncher.isEnabled()
    if (!isEnabled) {
      await autoLauncher.enable()
      logger.info('Auto-launch enabled')
    }
  } catch (err) {
    logger.warn('Could not enable auto-launch:', err)
  }
}
