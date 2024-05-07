export type Category = 'beverages' | 'food' | 'tools' | 'medicine' | 'fire' | 'money'
export type Status = 'success' | 'warning' | 'error' | 'new'
export interface InventoryItem {
  id: string
  name: string
  amount: string
  date?: string
}
