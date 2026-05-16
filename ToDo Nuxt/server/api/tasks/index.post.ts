import { tasks, type Task } from '../../utils/taskStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<Task>>(event)
  const title = body.title?.trim()

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El titulo de la tarea es obligatorio'
    })
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description: body.description?.trim() ?? '',
    favorite: Boolean(body.favorite),
    completed: Boolean(body.completed),
    createdAt: new Date().toISOString()
  }

  tasks.unshift(task)

  return task
})
