import { findGroupIndex, groups } from '../../utils/classStore'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const index = id ? findGroupIndex(id) : -1

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Grupo no encontrado'
    })
  }

  const [group] = groups.splice(index, 1)

  return group
})
