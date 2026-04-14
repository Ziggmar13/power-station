export type CommandAction = 'wake' | 'shutdown'
export type CommandStatus = 'pending' | 'executed' | 'failed'

export interface Command {
  id: string
  computer_id: string
  action: CommandAction
  status: CommandStatus
  created_at: string
}

export type CreateCommandInput = Pick<Command, 'computer_id' | 'action'>
