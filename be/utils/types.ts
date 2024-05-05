export interface InventoryItem {
  id: string;
  name: string;
  amount: string;
  date?: string;
}

export interface Inventory {
  beverages: InventoryItem[];
  food: InventoryItem[];
  medicine: InventoryItem[];
  fire: InventoryItem[];
  tools: InventoryItem[];
  custom: InventoryItem[];
}
