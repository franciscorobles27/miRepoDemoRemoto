<script setup lang="ts">
interface Task {
  id: string
  title: string
  description: string
  favorite: boolean
  completed: boolean
  createdAt: string
}

const tasks = ref<Task[]>([])
const title = ref('')
const description = ref('')
const editingId = ref<string | null>(null)
const filter = ref<'all' | 'pending' | 'completed' | 'favorites'>('all')
const errorMessage = ref('')

const editingTask = computed(() => tasks.value.find((task) => task.id === editingId.value))

const visibleTasks = computed(() => {
  if (filter.value === 'pending') {
    return tasks.value.filter((task) => !task.completed)
  }

  if (filter.value === 'completed') {
    return tasks.value.filter((task) => task.completed)
  }

  if (filter.value === 'favorites') {
    return tasks.value.filter((task) => task.favorite)
  }

  return tasks.value
})

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter((task) => task.completed).length,
  favorites: tasks.value.filter((task) => task.favorite).length
}))

async function loadTasks() {
  tasks.value = await $fetch<Task[]>('/api/tasks')
}

function resetForm() {
  title.value = ''
  description.value = ''
  editingId.value = null
  errorMessage.value = ''
}

function startEditing(task: Task) {
  editingId.value = task.id
  title.value = task.title
  description.value = task.description
  errorMessage.value = ''
}

async function saveTask() {
  errorMessage.value = ''

  try {
    if (editingTask.value) {
      await $fetch(`/api/tasks/${editingTask.value.id}`, {
        method: 'PUT',
        body: {
          title: title.value,
          description: description.value
        }
      })
    } else {
      await $fetch('/api/tasks', {
        method: 'POST',
        body: {
          title: title.value,
          description: description.value
        }
      })
    }

    resetForm()
    await loadTasks()
  } catch {
    errorMessage.value = 'Escribe un titulo para guardar la tarea.'
  }
}

async function toggleCompleted(task: Task) {
  await $fetch(`/api/tasks/${task.id}`, {
    method: 'PUT',
    body: { completed: !task.completed }
  })
  await loadTasks()
}

async function toggleFavorite(task: Task) {
  await $fetch(`/api/tasks/${task.id}`, {
    method: 'PUT',
    body: { favorite: !task.favorite }
  })
  await loadTasks()
}

async function removeTask(task: Task) {
  await $fetch(`/api/tasks/${task.id}`, {
    method: 'DELETE'
  })

  if (editingId.value === task.id) {
    resetForm()
  }

  await loadTasks()
}

onMounted(loadTasks)
</script>

<template>
  <main class="page">
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Nuxt + Backend en memoria</p>
          <h1>TODO Nuxt</h1>
        </div>
        <div class="stats" aria-label="Resumen de tareas">
          <span>{{ stats.total }} tareas</span>
          <span>{{ stats.completed }} realizadas</span>
          <span>{{ stats.favorites }} favoritas</span>
        </div>
      </header>

      <section class="workspace">
        <form class="task-form" @submit.prevent="saveTask">
          <h2>{{ editingTask ? 'Modificar tarea' : 'Nueva tarea' }}</h2>
          <label>
            Titulo
            <input v-model="title" type="text" placeholder="Ej. Estudiar Nuxt" />
          </label>
          <label>
            Descripcion
            <textarea v-model="description" rows="4" placeholder="Detalles de la tarea"></textarea>
          </label>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <div class="actions">
            <button type="submit">{{ editingTask ? 'Guardar cambios' : 'Agregar tarea' }}</button>
            <button v-if="editingTask" class="secondary" type="button" @click="resetForm">
              Cancelar
            </button>
          </div>
        </form>

        <section class="tasks-panel">
          <div class="filters" aria-label="Filtros de tareas">
            <button :class="{ active: filter === 'all' }" type="button" @click="filter = 'all'">
              Todas
            </button>
            <button :class="{ active: filter === 'pending' }" type="button" @click="filter = 'pending'">
              Pendientes
            </button>
            <button :class="{ active: filter === 'completed' }" type="button" @click="filter = 'completed'">
              Realizadas
            </button>
            <button :class="{ active: filter === 'favorites' }" type="button" @click="filter = 'favorites'">
              Favoritas
            </button>
          </div>

          <ul v-if="visibleTasks.length" class="task-list">
            <li v-for="task in visibleTasks" :key="task.id" class="task-card" :class="{ done: task.completed }">
              <div class="task-content">
                <button class="check" type="button" :aria-label="task.completed ? 'Marcar pendiente' : 'Marcar realizada'" @click="toggleCompleted(task)">
                  {{ task.completed ? '✓' : '' }}
                </button>
                <div>
                  <h3>{{ task.title }}</h3>
                  <p>{{ task.description || 'Sin descripcion' }}</p>
                </div>
              </div>

              <div class="task-actions">
                <button class="icon-button" type="button" :title="task.favorite ? 'Quitar favorita' : 'Marcar favorita'" @click="toggleFavorite(task)">
                  {{ task.favorite ? '★' : '☆' }}
                </button>
                <button class="small" type="button" @click="startEditing(task)">Editar</button>
                <button class="small danger" type="button" @click="removeTask(task)">Eliminar</button>
              </div>
            </li>
          </ul>

          <p v-else class="empty">No hay tareas para este filtro.</p>
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  padding: 2rem;
  background: #f4f7f5;
  color: #18231f;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.shell {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 0 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #1c7c54;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  line-height: 1;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.stats span,
.filters button {
  border: 1px solid #cbd8d0;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  background: #ffffff;
  color: #30423a;
  font-weight: 700;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 1.2rem;
  align-items: start;
}

.task-form,
.tasks-panel {
  border: 1px solid #d7e0db;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(24, 35, 31, 0.08);
}

.task-form {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
}

.task-form h2 {
  font-size: 1.3rem;
}

label {
  display: grid;
  gap: 0.4rem;
  color: #3c4a43;
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cbd8d0;
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
  color: #18231f;
  font: inherit;
}

textarea {
  resize: vertical;
}

button {
  border: 0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: #1c7c54;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

button:hover {
  filter: brightness(0.96);
}

.actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.secondary {
  background: #e5ece8;
  color: #26352f;
}

.error {
  color: #b42318;
  font-weight: 700;
}

.tasks-panel {
  padding: 1rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filters button {
  cursor: pointer;
}

.filters .active {
  border-color: #1c7c54;
  background: #daf6e9;
  color: #155d40;
}

.task-list {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #d7e0db;
  border-radius: 8px;
  padding: 0.9rem;
  background: #fbfdfc;
}

.task-card.done h3 {
  text-decoration: line-through;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.task-content h3 {
  font-size: 1rem;
}

.task-content p {
  margin-top: 0.25rem;
  color: #5a6a62;
  overflow-wrap: anywhere;
}

.check,
.icon-button {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.3rem;
  height: 2.3rem;
  padding: 0;
}

.check {
  border: 2px solid #1c7c54;
  background: #ffffff;
  color: #1c7c54;
}

.icon-button {
  background: #fff4c7;
  color: #8a5a00;
  font-size: 1.2rem;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.small {
  padding: 0.55rem 0.7rem;
  background: #e8f2ee;
  color: #155d40;
}

.danger {
  background: #ffe8e6;
  color: #a2392f;
}

.empty {
  padding: 2rem 1rem;
  color: #5a6a62;
  text-align: center;
}

@media (max-width: 820px) {
  .page {
    padding: 1rem;
  }

  .topbar,
  .task-card {
    align-items: stretch;
    flex-direction: column;
  }

  .stats {
    justify-content: flex-start;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .task-actions {
    justify-content: flex-start;
  }
}
</style>
