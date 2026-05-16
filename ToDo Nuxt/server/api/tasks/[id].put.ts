import { findTask, type Task } from '../../utils/taskStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const task = id ? findTask(id) : null

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tarea no encontrada'
    })
  }

  const body = await readBody<Partial<Task>>(event)
  const title = body.title?.trim()

  if (body.title !== undefined && !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El titulo de la tarea es obligatorio'
    })
  }

  if (title !== undefined) {
    task.title = title
  }

  if (body.description !== undefined) {
    task.description = body.description.trim()
  }

  if (body.favorite !== undefined) {
    task.favorite = Boolean(body.favorite)
  }

  if (body.completed !== undefined) {
    task.completed = Boolean(body.completed)
  }

  return task
})
