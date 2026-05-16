import { groups, type Group } from '../../utils/classStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<Group>>(event)
  const name = body.name?.trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del grupo es obligatorio'
    })
  }

  const group: Group = {
    id: crypto.randomUUID(),
    name,
    subject: body.subject?.trim() || 'Sin materia',
    students: [],
    attendanceRecords: []
  }

  groups.unshift(group)

  return group
})
