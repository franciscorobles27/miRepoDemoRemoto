<script setup lang="ts">
interface Student {
  id: string
  name: string
  email: string
}

interface AttendanceRecord {
  id: string
  date: string
  presentStudentIds: string[]
}

interface Group {
  id: string
  name: string
  subject: string
  students: Student[]
  attendanceRecords: AttendanceRecord[]
  attendancePercentage: number
}

const groups = ref<Group[]>([])
const selectedGroupId = ref('')
const groupName = ref('')
const groupSubject = ref('')
const editingGroupId = ref<string | null>(null)
const studentName = ref('')
const studentEmail = ref('')
const editingStudentId = ref<string | null>(null)
const attendanceDate = ref(new Date().toISOString().slice(0, 10))
const presentStudentIds = ref<string[]>([])
const errorMessage = ref('')

const selectedGroup = computed(() =>
  groups.value.find((group) => group.id === selectedGroupId.value) ?? groups.value[0]
)

const selectedRecord = computed(() =>
  selectedGroup.value?.attendanceRecords.find((record) => record.date === attendanceDate.value)
)

const dashboard = computed(() =>
  groups.value.map((group) => ({
    id: group.id,
    name: group.name,
    subject: group.subject,
    students: group.students.length,
    records: group.attendanceRecords.length,
    percentage: group.attendancePercentage
  }))
)

const totalStudents = computed(() =>
  groups.value.reduce((total, group) => total + group.students.length, 0)
)

const totalRecords = computed(() =>
  groups.value.reduce((total, group) => total + group.attendanceRecords.length, 0)
)

async function loadGroups() {
  groups.value = await $fetch<Group[]>('/api/groups')

  if (!selectedGroupId.value && groups.value.length) {
    selectedGroupId.value = groups.value[0].id
  }

  syncAttendance()
}

function syncAttendance() {
  presentStudentIds.value = selectedRecord.value ? [...selectedRecord.value.presentStudentIds] : []
}

function resetGroupForm() {
  groupName.value = ''
  groupSubject.value = ''
  editingGroupId.value = null
  errorMessage.value = ''
}

function resetStudentForm() {
  studentName.value = ''
  studentEmail.value = ''
  editingStudentId.value = null
  errorMessage.value = ''
}

function selectGroup(groupId: string) {
  selectedGroupId.value = groupId
  resetStudentForm()
  syncAttendance()
}

function editGroup(group: Group) {
  editingGroupId.value = group.id
  groupName.value = group.name
  groupSubject.value = group.subject
}

async function saveGroup() {
  errorMessage.value = ''

  try {
    if (editingGroupId.value) {
      await $fetch(`/api/groups/${editingGroupId.value}`, {
        method: 'PUT',
        body: {
          name: groupName.value,
          subject: groupSubject.value
        }
      })
    } else {
      const created = await $fetch<Group>('/api/groups', {
        method: 'POST',
        body: {
          name: groupName.value,
          subject: groupSubject.value
        }
      })
      selectedGroupId.value = created.id
    }

    resetGroupForm()
    await loadGroups()
  } catch {
    errorMessage.value = 'Revisa los campos obligatorios.'
  }
}

async function removeGroup(group: Group) {
  await $fetch(`/api/groups/${group.id}`, { method: 'DELETE' })

  if (selectedGroupId.value === group.id) {
    selectedGroupId.value = ''
  }

  resetGroupForm()
  await loadGroups()
}

function editStudent(student: Student) {
  editingStudentId.value = student.id
  studentName.value = student.name
  studentEmail.value = student.email
}

async function saveStudent() {
  if (!selectedGroup.value) {
    return
  }

  errorMessage.value = ''

  try {
    if (editingStudentId.value) {
      await $fetch(`/api/groups/${selectedGroup.value.id}/students/${editingStudentId.value}`, {
        method: 'PUT',
        body: {
          name: studentName.value,
          email: studentEmail.value
        }
      })
    } else {
      await $fetch(`/api/groups/${selectedGroup.value.id}/students`, {
        method: 'POST',
        body: {
          name: studentName.value,
          email: studentEmail.value
        }
      })
    }

    resetStudentForm()
    await loadGroups()
  } catch {
    errorMessage.value = 'El nombre del alumno es obligatorio.'
  }
}

async function removeStudent(student: Student) {
  if (!selectedGroup.value) {
    return
  }

  await $fetch(`/api/groups/${selectedGroup.value.id}/students/${student.id}`, {
    method: 'DELETE'
  })

  resetStudentForm()
  await loadGroups()
}

function togglePresence(studentId: string) {
  if (presentStudentIds.value.includes(studentId)) {
    presentStudentIds.value = presentStudentIds.value.filter((id) => id !== studentId)
  } else {
    presentStudentIds.value = [...presentStudentIds.value, studentId]
  }
}

async function saveAttendance() {
  if (!selectedGroup.value) {
    return
  }

  await $fetch(`/api/groups/${selectedGroup.value.id}/attendance`, {
    method: 'POST',
    body: {
      date: attendanceDate.value,
      presentStudentIds: presentStudentIds.value
    }
  })

  await loadGroups()
}

watch([selectedGroupId, attendanceDate], syncAttendance)

onMounted(loadGroups)
</script>

<template>
  <main class="page">
    <header class="header">
      <div>
        <p class="eyebrow">Control de clase</p>
        <h1>Lista Profesor</h1>
      </div>
      <div class="summary">
        <span>{{ groups.length }} grupos</span>
        <span>{{ totalStudents }} alumnos</span>
        <span>{{ totalRecords }} listas</span>
      </div>
    </header>

    <section class="dashboard" aria-label="Dashboard de asistencias">
      <article v-for="item in dashboard" :key="item.id" class="metric">
        <div>
          <h2>{{ item.name }}</h2>
          <p>{{ item.subject }} · {{ item.students }} alumnos · {{ item.records }} listas</p>
        </div>
        <strong>{{ item.percentage }}%</strong>
      </article>
    </section>

    <section class="layout">
      <aside class="panel groups-panel">
        <form class="form" @submit.prevent="saveGroup">
          <h2>{{ editingGroupId ? 'Editar grupo' : 'Nuevo grupo' }}</h2>
          <label>
            Grupo
            <input v-model="groupName" type="text" placeholder="Ej. 4A Programacion" />
          </label>
          <label>
            Materia
            <input v-model="groupSubject" type="text" placeholder="Ej. Nuxt.js" />
          </label>
          <div class="actions">
            <button type="submit">{{ editingGroupId ? 'Guardar' : 'Crear grupo' }}</button>
            <button v-if="editingGroupId" class="muted" type="button" @click="resetGroupForm">
              Cancelar
            </button>
          </div>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>

        <div class="group-list">
          <button
            v-for="group in groups"
            :key="group.id"
            class="group-item"
            :class="{ active: selectedGroup?.id === group.id }"
            type="button"
            @click="selectGroup(group.id)"
          >
            <span>{{ group.name }}</span>
            <small>{{ group.students.length }} alumnos</small>
          </button>
        </div>
      </aside>

      <section v-if="selectedGroup" class="panel class-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Grupo seleccionado</p>
            <h2>{{ selectedGroup.name }}</h2>
            <p>{{ selectedGroup.subject }}</p>
          </div>
          <div class="header-actions">
            <button class="muted" type="button" @click="editGroup(selectedGroup)">Editar grupo</button>
            <button class="danger" type="button" @click="removeGroup(selectedGroup)">Eliminar grupo</button>
          </div>
        </div>

        <div class="class-grid">
          <form class="form student-form" @submit.prevent="saveStudent">
            <h3>{{ editingStudentId ? 'Editar alumno' : 'Agregar alumno' }}</h3>
            <label>
              Nombre
              <input v-model="studentName" type="text" placeholder="Nombre completo" />
            </label>
            <label>
              Correo
              <input v-model="studentEmail" type="email" placeholder="correo@escuela.com" />
            </label>
            <div class="actions">
              <button type="submit">{{ editingStudentId ? 'Guardar alumno' : 'Agregar alumno' }}</button>
              <button v-if="editingStudentId" class="muted" type="button" @click="resetStudentForm">
                Cancelar
              </button>
            </div>
          </form>

          <section class="attendance">
            <div class="attendance-top">
              <h3>Pasar lista</h3>
              <input v-model="attendanceDate" type="date" />
            </div>

            <ul v-if="selectedGroup.students.length" class="student-list">
              <li v-for="student in selectedGroup.students" :key="student.id">
                <button
                  class="presence"
                  :class="{ present: presentStudentIds.includes(student.id) }"
                  type="button"
                  @click="togglePresence(student.id)"
                >
                  {{ presentStudentIds.includes(student.id) ? 'Presente' : 'Ausente' }}
                </button>
                <div>
                  <strong>{{ student.name }}</strong>
                  <span>{{ student.email || 'Sin correo' }}</span>
                </div>
                <div class="student-actions">
                  <button class="small" type="button" @click="editStudent(student)">Editar</button>
                  <button class="small danger" type="button" @click="removeStudent(student)">Eliminar</button>
                </div>
              </li>
            </ul>

            <p v-else class="empty">Agrega alumnos para pasar lista.</p>

            <button class="save-attendance" type="button" @click="saveAttendance">
              Guardar asistencia
            </button>
          </section>
        </div>
      </section>

      <section v-else class="panel empty-state">
        <h2>Crea un grupo para comenzar</h2>
        <p>Despues podras agregar alumnos y registrar asistencias.</p>
      </section>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  padding: 1.5rem;
  background: #f3f4f1;
  color: #1d2625;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1180px;
  margin: 0 auto 1rem;
}

.eyebrow,
h1,
h2,
h3,
p {
  margin: 0;
}

.eyebrow {
  color: #2f6f73;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin-top: 0.25rem;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  line-height: 1;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.summary span {
  border: 1px solid #cfd8d5;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  background: #ffffff;
  font-weight: 800;
}

.dashboard,
.layout {
  max-width: 1180px;
  margin: 0 auto;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.metric,
.panel {
  border: 1px solid #d7dfdc;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(29, 38, 37, 0.08);
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.metric h2 {
  font-size: 1rem;
}

.metric p,
.panel-header p,
.student-list span,
.empty-state p {
  color: #687572;
}

.metric strong {
  color: #1d6d55;
  font-size: 2rem;
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
  align-items: start;
}

.panel {
  padding: 1rem;
}

.form {
  display: grid;
  gap: 0.85rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #33413f;
  font-weight: 800;
}

input {
  width: 100%;
  border: 1px solid #c9d5d1;
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
  color: #1d2625;
  font: inherit;
}

button {
  border: 0;
  border-radius: 8px;
  padding: 0.72rem 0.9rem;
  background: #2f6f73;
  color: #ffffff;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
}

button:hover {
  filter: brightness(0.97);
}

.actions,
.header-actions,
.student-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.muted,
.small {
  background: #e8efed;
  color: #2b403d;
}

.danger {
  background: #ffe8e5;
  color: #9d2f26;
}

.small {
  padding: 0.5rem 0.65rem;
}

.error {
  color: #b42318;
  font-weight: 800;
}

.group-list {
  display: grid;
  gap: 0.55rem;
  margin-top: 1rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  border: 1px solid #d7dfdc;
  background: #fbfcfb;
  color: #21302d;
  text-align: left;
}

.group-item.active {
  border-color: #2f6f73;
  background: #ddf2ef;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #e0e7e4;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.class-grid {
  display: grid;
  grid-template-columns: minmax(240px, 300px) 1fr;
  gap: 1rem;
}

.student-form {
  align-content: start;
}

.attendance-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.student-list {
  display: grid;
  gap: 0.65rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.student-list li {
  display: grid;
  grid-template-columns: 7.5rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #d7dfdc;
  border-radius: 8px;
  padding: 0.75rem;
  background: #fbfcfb;
}

.student-list strong,
.student-list span {
  display: block;
}

.presence {
  background: #f0d8d4;
  color: #7c2d24;
}

.presence.present {
  background: #d9f0df;
  color: #176039;
}

.save-attendance {
  width: 100%;
  margin-top: 0.85rem;
}

.empty,
.empty-state {
  color: #687572;
  text-align: center;
}

.empty {
  padding: 1.6rem 1rem;
}

@media (max-width: 920px) {
  .header,
  .panel-header {
    align-items: stretch;
    flex-direction: column;
  }

  .summary {
    justify-content: flex-start;
  }

  .dashboard,
  .layout,
  .class-grid {
    grid-template-columns: 1fr;
  }

  .student-list li {
    grid-template-columns: 1fr;
  }
}
</style>
