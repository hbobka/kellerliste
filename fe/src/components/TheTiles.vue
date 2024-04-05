<script setup lang="ts">
import TileItem from '@/components/TileItem.vue'
</script>

<template>
  <div class="category-wrapper">
    <TileItem icon="fa-bottle-droplet" text="Getränke" status="success" category="beverages"/>
    <TileItem icon="fa-utensils" text="Lebensmittel" status="warning" category="food"/>
    <TileItem icon="fa-screwdriver-wrench" text="Werkzeug" status="error" category="tools"/>
    <TileItem icon="fa-briefcase-medical" text="Medizin" status="error" category="medicine"/>
    <TileItem icon="fa-fire" text="Feuermittel" status="warning" category="fire"/>
    <TileItem icon="fa-plus" text="Hinzufügen" status="new" category="new"/>
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
