import { findTaskIndex, tasks } from '../../utils/taskStore'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const index = id ? findTaskIndex(id) : -1

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tarea no encontrada'
    })
  }

  const [task] = tasks.splice(index, 1)

  return task
})
