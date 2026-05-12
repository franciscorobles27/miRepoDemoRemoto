<template>
  <section class="user-panel">
    <div class="panel-header">
      <span>Formulario</span>
      <h2>Datos del usuario</h2>
    </div>

    <div class="counter-box">
      <p>Contador</p>

      <div class="counter">
        <button class="btn minus" @click="decrementar">−</button>
        <strong>{{ contador }}</strong>
        <button class="btn plus" @click="incrementar">+</button>
      </div>
    </div>

    <form class="form" @submit.prevent>
      <div class="field">
        <label>Nombre</label>
        <input
          v-model="usuario.nombre"
          type="text"
          placeholder="Ingresa tu nombre"
        />
      </div>

      <div class="field">
        <label>Correo electrónico</label>
        <input
          v-model="usuario.correo"
          type="email"
          placeholder="Ingresa tu correo"
        />
      </div>
    </form>

    <div class="results">
      <h3>Valores capturados</h3>

      <div class="result-card">
        <span>Nombre</span>
        <strong>{{ usuario.nombre || 'Sin capturar' }}</strong>
      </div>

      <div class="result-card">
        <span>Correo</span>
        <strong>{{ usuario.correo || 'Sin capturar' }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const contador = ref(0)

const usuario = reactive({
  nombre: '',
  correo: ''
})

const incrementar = () => {
  contador.value++
}

const decrementar = () => {
  contador.value--
}
</script>