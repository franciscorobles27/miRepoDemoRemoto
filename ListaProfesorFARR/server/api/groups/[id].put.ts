import { findGroup, type Group } from '../../utils/classStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const group = id ? findGroup(id) : null

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Grupo no encontrado'
    })
  }

  const body = await readBody<Partial<Group>>(event)
  const name = body.name?.trim()

  if (body.name !== undefined && !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del grupo es obligatorio'
    })
  }

  if (name !== undefined) {
    group.name = name
  }

  if (body.subject !== undefined) {
    group.subject = body.subject.trim() || 'Sin materia'
  }

  return group
})
