import { readonly, ref } from 'vue'

interface Item {
  name: string
  amount: string
  date?: string
}

interface Inventory {
  beverages: Item[]
  food: Item[]
  medicine: Item[]
  fire: Item[]
  tools: Item[]
  custom: Item[]
}

const stateInventory = ref<Inventory>({
  beverages: [],
  food: [],
  medicine: [],
  fire: [],
  tools: [],
  custom: []
})

export const useInventory = () => {
  const getInventory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/items/jon.doe@gmail.com`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setInventory(data.inventory)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const setInventory = (inventory: Inventory) => {
    stateInventory.value.beverages = inventory.beverages
    stateInventory.value.food = inventory.food
    stateInventory.value.medicine = inventory.medicine
    stateInventory.value.fire = inventory.fire
    stateInventory.value.tools = inventory.tools
    stateInventory.value.custom = inventory.custom
  }

  return {
    stateInventory: readonly(stateInventory),
    getInventory
  }
}
