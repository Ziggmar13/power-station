import { app, BrowserWindow } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'
import { createTray } from './tray'
import { startRealtimeClient } from './realtime-client'
import { enableAutoLaunch } from './autolaunch'

// Load .env from the directory next to the executable (or project root in dev)
dotenv.config({ path: path.join(process.resourcesPath ?? app.getAppPath(), '.env') })
dotenv.config() // fallback for dev (loads from cwd)

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  COMPUTER_ID,
  APP_URL = 'https://your-app.vercel.app',
} = process.env

function validateEnv(): void {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'COMPUTER_ID'].filter(
    (key) => !process.env[key],
  )
  if (missing.length > 0) {
    logger.error(`Missing environment variables: ${missing.join(', ')}`)
    logger.error(
      'Please set these in the .env file next to the application executable.',
    )
    app.quit()
  }
}

app.whenReady().then(async () => {
  // Prevent creating a dock icon on macOS (no-op on Windows)
  app.dock?.hide()

  validateEnv()

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !COMPUTER_ID) return

  createTray('Loading...')
  await enableAutoLaunch()

  try {
    await startRealtimeClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, COMPUTER_ID, APP_URL)
  } catch (err) {
    logger.error('Failed to start realtime client:', err)
    // Don't quit — tray icon still visible for troubleshooting
  }
})

// Prevent quitting when all windows are closed (tray app behaviour)
app.on('window-all-closed', () => {
  // Do nothing — keep alive as tray app
})

// Required to prevent Electron from opening a window on macOS when dock icon clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // No window to restore — this is intentional for a tray-only app
  }
})
