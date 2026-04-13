export interface Computer {
  id: string
  name: string
  mac_address: string
  broadcast_address: string
  created_at: string
}

export type CreateComputerInput = Pick<Computer, 'name' | 'mac_address'> & {
  broadcast_address?: string
}

export type UpdateComputerInput = Partial<CreateComputerInput>
