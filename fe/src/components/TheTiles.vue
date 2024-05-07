<script setup lang="ts">
import TileItem from '@/components/TileItem.vue'
</script>

<template>
  <div class="category-wrapper">
    <TileItem icon="mdi-bottle-soda" text="Getränke" status="success" category="beverages"/>
    <TileItem icon="mdi-food" text="Lebensmittel" status="warning" category="food"/>
    <TileItem icon="mdi-tools" text="Werkzeug" status="error" category="tools"/>
    <TileItem icon="mdi-medical-bag" text="Medizin" status="error" category="medicine"/>
    <TileItem icon="mdi-fire" text="Feuermittel" status="warning" category="fire"/>
    <TileItem icon="mdi-cash-100" text="Geld" status="new" category="money"/>
  </div>
</template>

<style scoped>
.category-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--kl-tile-size) * 3 + 2rem * 2); /* tilesize * tiles + gapsize * gaps*/
  margin: 0 auto;
}

@media (max-width: 900px) {
  .category-wrapper {
    flex-direction: column;
    align-items: center;
    width: 100%;
    top: 8rem;
    left: initial;
    transform: initial;
  }
}
</style>
