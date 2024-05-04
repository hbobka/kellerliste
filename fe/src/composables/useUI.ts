import { readonly, ref } from 'vue'

const stateUI = ref({
  wasInventoryFetched: false
})

export const useUI = () => {
  /**
   * set the state wasInventoryFetched
   * @param wasInventoryFetched
   */
  const setWasInventoryFetched = (wasInventoryFetched: boolean) => {
    stateUI.value.wasInventoryFetched = wasInventoryFetched
  }

  return {
    setWasInventoryFetched,
    stateUI: readonly(stateUI)
  }
}
