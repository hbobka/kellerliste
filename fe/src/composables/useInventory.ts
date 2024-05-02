import { readonly, ref } from 'vue'
import { useAuth } from './useAuth'

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
  const { stateAuth } = useAuth()

  const getInventory = async () => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_GATEWAY_URL}/prod/items/${stateAuth.value.userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${stateAuth.value.idToken}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
      }
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
    getInventory,
    stateInventory: readonly(stateInventory)
  }
}
