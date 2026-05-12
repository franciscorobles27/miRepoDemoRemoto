<template>
  <article class="pokemon-card" :style="{ '--accent': pokemon.color }">
    <div class="pokemon-top">
      <span>#{{ pokemon.id }}</span>
      <small>{{ pokemon.tipo }}</small>
    </div>

    <div class="pokemon-img">
      <img :src="pokemon.imagen" :alt="pokemon.nombre" />
    </div>

    <div class="pokemon-content">
      <h3>{{ pokemon.nombre }}</h3>
      <p>{{ pokemon.descripcion }}</p>
    </div>

    <button class="pokemon-btn">Ver detalles</button>
  </article>
</template>

<script setup>
defineProps({
  pokemon: {
    type: Object,
    required: true
  }
})
</script>