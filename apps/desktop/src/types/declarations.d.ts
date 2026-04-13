declare module 'wake_on_lan' {
  interface WakeOptions {
    address?: string
    port?: number
  }
  function wake(
    macAddress: string,
    options: WakeOptions,
    callback: (err: Error | null) => void,
  ): void
  export = { wake }
}

declare module 'auto-launch' {
  interface AutoLaunchOptions {
    name: string
    path?: string
    isHidden?: boolean
    mac?: { useLaunchAgent?: boolean }
  }
  class AutoLaunch {
    constructor(options: AutoLaunchOptions)
    enable(): Promise<void>
    disable(): Promise<void>
    isEnabled(): Promise<boolean>
  }
  export = AutoLaunch
}
