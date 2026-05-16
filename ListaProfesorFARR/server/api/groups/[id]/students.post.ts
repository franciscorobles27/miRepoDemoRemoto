import { findGroup, type Student } from '../../../utils/classStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const group = id ? findGroup(id) : null

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Grupo no encontrado'
    })
  }

  const body = await readBody<Partial<Student>>(event)
  const name = body.name?.trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del alumno es obligatorio'
    })
  }

  const student: Student = {
    id: crypto.randomUUID(),
    name,
    email: body.email?.trim() || ''
  }

  group.students.push(student)

  return student
})
