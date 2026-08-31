export type Line = {
  name: string
  quantity: string
  unitPrice: string
  custom: boolean
}

export const CUSTOM = '__custom__'

export const newLine = (): Line => ({
  name: '',
  quantity: '1',
  unitPrice: '',
  custom: false,
})
