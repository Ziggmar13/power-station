export const INTENTS = {
  TURN_ON: 'TurnOnComputerIntent',
  TURN_OFF: 'TurnOffComputerIntent',
  HELP: 'AMAZON.HelpIntent',
  STOP: 'AMAZON.StopIntent',
  CANCEL: 'AMAZON.CancelIntent',
} as const

export type IntentName = (typeof INTENTS)[keyof typeof INTENTS]
