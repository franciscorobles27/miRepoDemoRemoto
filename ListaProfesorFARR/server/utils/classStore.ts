export interface Student {
  id: string
  name: string
  email: string
}

export interface AttendanceRecord {
  id: string
  date: string
  presentStudentIds: string[]
}

export interface Group {
  id: string
  name: string
  subject: string
  students: Student[]
  attendanceRecords: AttendanceRecord[]
}

const today = new Date().toISOString().slice(0, 10)

const initialGroups: Group[] = [
  {
    id: 'grupo-1',
    name: 'Programacion Web',
    subject: 'Nuxt.js',
    students: [
      { id: 'alumno-1', name: 'Ana Lopez', email: 'ana@example.com' },
      { id: 'alumno-2', name: 'Carlos Ruiz', email: 'carlos@example.com' },
      { id: 'alumno-3', name: 'Mariana Torres', email: 'mariana@example.com' }
    ],
    attendanceRecords: [
      {
        id: 'asistencia-1',
        date: today,
        presentStudentIds: ['alumno-1', 'alumno-3']
      }
    ]
  },
  {
    id: 'grupo-2',
    name: 'Bases de Datos',
    subject: 'CRUD',
    students: [
      { id: 'alumno-4', name: 'Diego Martinez', email: 'diego@example.com' },
      { id: 'alumno-5', name: 'Sofia Hernandez', email: 'sofia@example.com' }
    ],
    attendanceRecords: []
  }
]

const store = globalThis as typeof globalThis & { listaProfesorGroups?: Group[] }

export const groups = store.listaProfesorGroups ??= [...initialGroups]

export function findGroup(id: string) {
  return groups.find((group) => group.id === id)
}

export function findGroupIndex(id: string) {
  return groups.findIndex((group) => group.id === id)
}

export function findStudentIndex(group: Group, studentId: string) {
  return group.students.findIndex((student) => student.id === studentId)
}

export function calculateAttendancePercentage(group: Group) {
  const totalChecks = group.students.length * group.attendanceRecords.length

  if (totalChecks === 0) {
    return 0
  }

  const presentChecks = group.attendanceRecords.reduce(
    (total, record) => total + record.presentStudentIds.length,
    0
  )

  return Math.round((presentChecks / totalChecks) * 100)
}
