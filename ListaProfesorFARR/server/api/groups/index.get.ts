import { calculateAttendancePercentage, groups } from '../../utils/classStore'

export default defineEventHandler(() => {
  return groups.map((group) => ({
    ...group,
    attendancePercentage: calculateAttendancePercentage(group)
  }))
})
