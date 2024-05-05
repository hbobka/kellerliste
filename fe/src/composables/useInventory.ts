import { readonly, ref } from 'vue'
import { useAuth } from './useAuth'
import type { Category, Item } from '@/utils/types'

interface InventoryState {
  beverages: Item[]
  food: Item[]
  medicine: Item[]
  fire: Item[]
  tools: Item[]
  custom: Item[]
}

const stateInventory = ref<InventoryState>({
  beverages: [],
  food: [],
  medicine: [],
  fire: [],
  tools: [],
  custom: []
})

/**
 * holds all inventory functionalities
 */
export const useInventory = () => {
  const { stateAuth } = useAuth()

  const getInventory = async () => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}`
      const response = await fetch(`${url}/items/${stateAuth.value.userEmail}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateAuth.value.idToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
      }
    } catch (error) {
      console.error('getInventory failed: ', error)
    }
  }

  const createInventoryItem = async (item: Item, category: Category) => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const userEmail = stateAuth.value.userEmail
      const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}`
      const response = await fetch(`${url}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateAuth.value.idToken}`
        },
        body: JSON.stringify({ userEmail, item, category })
      })

      if (!response.ok) {
        throw new Error('Failed to create item')
      }
      // update the inventory after creating the item
      await getInventory()
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const deleteInventoryItem = async (itemId: string) => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}`
      const response = await fetch(`${url}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateAuth.value.idToken}`
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      // update the inventory after creating the item
      await getInventory()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const setInventory = (inventory: InventoryState) => {
    stateInventory.value.beverages = inventory.beverages
    stateInventory.value.food = inventory.food
    stateInventory.value.medicine = inventory.medicine
    stateInventory.value.fire = inventory.fire
    stateInventory.value.tools = inventory.tools
    stateInventory.value.custom = inventory.custom
  }

  return {
    getInventory,
    createInventoryItem,
    deleteInventoryItem,
    stateInventory: readonly(stateInventory)
  }
}
