import { app, Menu, Tray } from 'electron'
import path from 'path'
import { logger } from '../utils/logger'

let tray: Tray | null = null

function getIconPath(connected: boolean): string {
  const iconFile = connected ? 'icon-connected.ico' : 'icon-disconnected.ico'
  // In packaged app, __dirname resolves inside asar. Use app.getAppPath() for assets.
  return path.join(app.getAppPath(), 'assets', iconFile)
}

export function createTray(computerName: string): Tray {
  tray = new Tray(getIconPath(false))
  tray.setToolTip('Power Station — connecting...')
  updateTrayMenu(computerName, false)
  logger.info('Tray created')
  return tray
}

export function updateTrayStatus(computerName: string, connected: boolean): void {
  if (!tray) return
  tray.setImage(getIconPath(connected))
  tray.setToolTip(
    connected
      ? `Power Station — ${computerName} (connected)`
      : `Power Station — ${computerName} (disconnected)`,
  )
  updateTrayMenu(computerName, connected)
}

function updateTrayMenu(computerName: string, connected: boolean): void {
  if (!tray) return
  const menu = Menu.buildFromTemplate([
    {
      label: computerName,
      enabled: false,
    },
    {
      label: connected ? 'Status: Connected' : 'Status: Disconnected',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(menu)
}
