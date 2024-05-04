export type Category = 'beverages' | 'food' | 'tools' | 'medicine' | 'fire' | 'custom' | 'new'
export type Status = 'success' | 'warning' | 'error' | 'new'
export interface Item {
  name: string
  amount: string
  date?: string
}
