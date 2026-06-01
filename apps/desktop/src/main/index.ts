import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'
import { createTray } from './tray'
import { startRealtimeClient } from './realtime-client'
import { enableAutoLaunch } from './autolaunch'

const envPath = app.isPackaged
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(__dirname, '../../.env')
dotenv.config({ path: envPath })
dotenv.config()

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  COMPUTER_ID,
  APP_URL = 'https://your-app.vercel.app',
} = process.env

function validateEnv(): boolean {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'COMPUTER_ID'].filter(
    (key) => !process.env[key],
  )
  if (missing.length > 0) {
    const message = `Missing environment variables: ${missing.join(', ')}\n\nExpected .env at:\n${envPath}\n\nPlease create it with SUPABASE_URL, SUPABASE_SERVICE_KEY, and COMPUTER_ID.`
    logger.error(message)
    dialog.showErrorBox('Power Station — Configuration Error', message)
    app.quit()
    return false
  }
  return true
}

app.whenReady().then(async () => {
  app.dock?.hide()

  if (!validateEnv()) return
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !COMPUTER_ID) return

  createTray('Loading...')

  try {
    await enableAutoLaunch()
  } catch (err) {
    logger.error('Failed to enable auto-launch:', err)
  }

  try {
    await startRealtimeClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, COMPUTER_ID, APP_URL)
  } catch (err) {
    logger.error('Failed to start realtime client:', err)
  }
})

app.on('window-all-closed', () => {
  // Tray-only app — stay alive when no windows are open
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Tray-only app — nothing to restore
  }
})
