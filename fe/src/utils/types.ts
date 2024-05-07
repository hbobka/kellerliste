export type Category = 'beverages' | 'food' | 'tools' | 'medicine' | 'fire' | 'money'
export type Status = 'success' | 'warning' | 'error'
export interface InventoryItem {
  id: string
  name: string
  amount: string
  date?: string
}
