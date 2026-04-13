/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'com.powerstation.desktop',
  productName: 'Power Station',
  copyright: 'Copyright © 2026',
  directories: {
    output: 'release',
    buildResources: 'assets',
  },
  files: ['out/**/*', 'package.json'],
  extraFiles: [
    { from: '.env', to: '.env' },
    { from: 'assets', to: 'assets' },
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    // icon and signAndEditExecutable disabled for dev builds — re-enable with real .ico + code signing cert for release
    signAndEditExecutable: false,
    requestedExecutionLevel: 'asInvoker',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: false,
    runAfterFinish: true,
  },
}

module.exports = config
