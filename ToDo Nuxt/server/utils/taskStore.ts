export interface Task {
  id: string
  title: string
  description: string
  favorite: boolean
  completed: boolean
  createdAt: string
}

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Crear proyecto Nuxt',
    description: 'Configurar la base del proyecto TODO.',
    favorite: true,
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Agregar tareas',
    description: 'Probar el formulario desde el frontend.',
    favorite: false,
    completed: false,
    createdAt: new Date().toISOString()
  }
]

const store = globalThis as typeof globalThis & { todoNuxtTasks?: Task[] }

export const tasks = store.todoNuxtTasks ??= [...defaultTasks]

export function findTask(id: string) {
  return tasks.find((task) => task.id === id)
}

export function findTaskIndex(id: string) {
  return tasks.findIndex((task) => task.id === id)
}
