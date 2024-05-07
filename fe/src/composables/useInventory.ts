import { readonly, ref } from 'vue'
import { useAuth } from './useAuth'
import type { Category, InventoryItem } from '@/utils/types'

interface InventoryState {
  beverages: InventoryItem[]
  food: InventoryItem[]
  medicine: InventoryItem[]
  fire: InventoryItem[]
  tools: InventoryItem[]
  custom: InventoryItem[]
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

  const getAllInventoryItems = async () => {
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

  const createInventoryItem = async (item: InventoryItem, category: Category) => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}`
      const response = await fetch(`${url}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateAuth.value.idToken}`
        },
        body: JSON.stringify({ item, category })
      })

      if (response.ok) {
        await getAllInventoryItems()
      }
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
        }
      })

      if (response.ok) {
        await getAllInventoryItems()
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const updateInventoryItem = async (itemId: string, item: InventoryItem) => {
    if (!stateAuth.value.idToken) {
      return
    }

    try {
      const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}`
      const response = await fetch(`${url}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stateAuth.value.idToken}`
        },
        body: JSON.stringify({ item })
      })

      if (response.ok) {
        await getAllInventoryItems()
      }
    } catch (error) {
      console.error('Failed to update item:', error)
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
    getAllInventoryItems,
    createInventoryItem,
    deleteInventoryItem,
    updateInventoryItem,
    stateInventory: readonly(stateInventory)
  }
}
