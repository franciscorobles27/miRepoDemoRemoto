import { findGroup } from '../../../utils/classStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const group = id ? findGroup(id) : null

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Grupo no encontrado'
    })
  }

  const body = await readBody<{ date?: string, presentStudentIds?: string[] }>(event)
  const date = body.date?.trim()

  if (!date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La fecha es obligatoria'
    })
  }

  const validStudentIds = new Set(group.students.map((student) => student.id))
  const presentStudentIds = [...new Set(body.presentStudentIds ?? [])].filter((studentId) =>
    validStudentIds.has(studentId)
  )
  const existingRecord = group.attendanceRecords.find((record) => record.date === date)

  if (existingRecord) {
    existingRecord.presentStudentIds = presentStudentIds
    return existingRecord
  }

  const record = {
    id: crypto.randomUUID(),
    date,
    presentStudentIds
  }

  group.attendanceRecords.unshift(record)

  return record
})
