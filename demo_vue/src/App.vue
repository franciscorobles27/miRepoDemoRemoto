<template>
  <main class="app">
    <section class="hero">
      <div>
        <span class="tag">Vue 3 + JavaScript</span>
        <h1>Práctica Vue</h1>
        <p>Contador, formulario reactivo y cards de Pokémon.</p>
      </div>

      <div class="resume-card">
        <span>Pokémon Cards</span>
        <strong>{{ pokemons.length }}</strong>
      </div>
    </section>

    <section class="dashboard">
      <FormularioUsuario />

      <section class="pokemon-section">
        <div class="section-title">
          <span>Componente Card</span>
          <h2>Pokémon destacados</h2>
        </div>

        <div class="pokemon-grid">
          <CardPokemon
            v-for="pokemon in pokemons"
            :key="pokemon.id"
            :pokemon="pokemon"
          />
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import FormularioUsuario from './components/FormularioUsuario.vue'
import CardPokemon from './components/CardPokemon.vue'

const pokemons = [
  {
    id: 25,
    nombre: 'Pikachu',
    tipo: 'Eléctrico',
    descripcion: 'Ágil, carismático y con gran energía eléctrica.',
    color: '#facc15',
    imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  },
  {
    id: 6,
    nombre: 'Charizard',
    tipo: 'Fuego / Volador',
    descripcion: 'Fuerte, imponente y con gran poder ofensivo.',
    color: '#fb923c',
    imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
  },
  {
    id: 9,
    nombre: 'Blastoise',
    tipo: 'Agua',
    descripcion: 'Resistente, defensivo y con ataques de alta presión.',
    color: '#38bdf8',
    imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'
  },
  {
    id: 3,
    nombre: 'Venusaur',
    tipo: 'Planta / Veneno',
    descripcion: 'Equilibrado, natural y con habilidades estratégicas.',
    color: '#4ade80',
    imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png'
  }
]
</script>