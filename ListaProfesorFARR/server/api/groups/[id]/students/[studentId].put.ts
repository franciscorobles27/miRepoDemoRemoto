import { findGroup, findStudentIndex, type Student } from '../../../../utils/classStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const studentId = getRouterParam(event, 'studentId')
  const group = id ? findGroup(id) : null

  if (!group || !studentId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Alumno no encontrado'
    })
  }

  const index = findStudentIndex(group, studentId)

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Alumno no encontrado'
    })
  }

  const body = await readBody<Partial<Student>>(event)
  const name = body.name?.trim()

  if (body.name !== undefined && !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del alumno es obligatorio'
    })
  }

  if (name !== undefined) {
    group.students[index].name = name
  }

  if (body.email !== undefined) {
    group.students[index].email = body.email.trim()
  }

  return group.students[index]
})
