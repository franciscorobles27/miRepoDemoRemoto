import { findGroup, findStudentIndex } from '../../../../utils/classStore'

export default defineEventHandler((event) => {
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

  for (const record of group.attendanceRecords) {
    record.presentStudentIds = record.presentStudentIds.filter((id) => id !== studentId)
  }

  const [student] = group.students.splice(index, 1)

  return student
})
