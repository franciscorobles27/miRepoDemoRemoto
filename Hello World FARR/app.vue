<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Proyecto Nuxt</p>
      <h1>Hello World</h1>
      <p class="message">
        Hola mundo desde Nuxt y JavaScript.
      </p>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.22), transparent 34rem),
    linear-gradient(135deg, #111827, #1f2937 45%, #0f172a);
  color: #f8fafc;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero {
  width: min(100%, 680px);
  text-align: center;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #86efac;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 1;
}

.message {
  margin: 1.25rem auto 0;
  max-width: 32rem;
  color: #d1d5db;
  font-size: 1.25rem;
  line-height: 1.6;
}
</style>
