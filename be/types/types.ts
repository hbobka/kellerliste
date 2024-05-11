export type Category = "beverages" | "food" | "tools" | "medicine" | "fire" | "money";

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
  money: InventoryItem[];
}

export type DEPLOYMENT_STAGE = "dev" | "prod";
