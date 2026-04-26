const projectForm = document.getElementById("projectForm");
const projectMessage = document.getElementById("projectMessage");
const projectRefreshButton = document.getElementById("projectRefreshButton");
const projectsList = document.getElementById("projectsList");
const projectParticipantsSelector = document.getElementById("projectParticipantsSelector");

const editProjectModal = document.getElementById("editProjectModal");
const editProjectForm = document.getElementById("editProjectForm");
const editProjectFormMessage = document.getElementById("editProjectFormMessage");
const editProjectParticipantsSelector = document.getElementById("editProjectParticipantsSelector");
const closeEditProjectModalButton = document.getElementById("closeEditProjectModalButton");
const cancelEditProjectModalButton = document.getElementById("cancelEditProjectModalButton");

const deleteProjectModal = document.getElementById("deleteProjectModal");
const deleteProjectModalText = document.getElementById("deleteProjectModalText");
const closeDeleteProjectModalButton = document.getElementById("closeDeleteProjectModalButton");
const cancelDeleteProjectModalButton = document.getElementById("cancelDeleteProjectModalButton");
const confirmDeleteProjectButton = document.getElementById("confirmDeleteProjectButton");

let currentProjects = [];
let currentMembers = [];
let editingProjectId = null;
let deletingProjectId = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showProjectMessage(text, isError = false) {
  if (!projectMessage) return;
  projectMessage.textContent = text;
  projectMessage.className = isError
    ? "mt-3 text-sm text-rose-600"
    : "mt-3 text-sm text-emerald-700";
}

function showEditProjectFormMessage(text, isError = false) {
  if (!editProjectFormMessage) return;
  editProjectFormMessage.textContent = text;
  editProjectFormMessage.className = isError
    ? "text-sm text-rose-600"
    : "text-sm text-emerald-700";
}

function renderParticipantSelector(members, container, selectedIds = []) {
  if (!container) return;

  if (!Array.isArray(members) || members.length === 0) {
    container.innerHTML =
      '<p class="text-sm text-slate-500">No hay miembros registrados.</p>';
    return;
  }

  container.innerHTML = members
    .map(
      (member) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-cyan-300">
          <input type="checkbox" name="participantes" value="${member.id}" ${selectedIds.includes(member.id) ? "checked" : ""} class="h-4 w-4 flex-shrink-0 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500">
          <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">${escapeHtml(member.nombre)}</span>
          <span class="flex-shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">${escapeHtml(member.rol)}</span>
        </label>
      `
    )
    .join("");
}

function showEditModal(project) {
  if (!editProjectModal || !editProjectForm) return;

  editingProjectId = project.id;
  editProjectForm.nombre.value = project.nombre;
  editProjectForm.tipo.value = project.tipo;
  editProjectForm.periodo.value = project.periodo;
  editProjectForm.descripcion.value = project.descripcion;
  
  const selectedIds = project.participantes || [];
  renderParticipantSelector(currentMembers, editProjectParticipantsSelector, selectedIds);
  
  showEditProjectFormMessage("", false);
  editProjectModal.classList.remove("hidden");
  editProjectForm.nombre.focus();
}

function hideEditModal() {
  if (!editProjectModal || !editProjectForm) return;

  editingProjectId = null;
  editProjectForm.reset();
  showEditProjectFormMessage("", false);
  editProjectModal.classList.add("hidden");
}

function showDeleteModal(project) {
  if (!deleteProjectModal || !deleteProjectModalText) return;

  deletingProjectId = project.id;
  deleteProjectModalText.textContent = `Seguro que deseas eliminar el proyecto: ${project.nombre}?`;
  deleteProjectModal.classList.remove("hidden");
}

function hideDeleteModal() {
  if (!deleteProjectModal) return;

  deletingProjectId = null;
  deleteProjectModal.classList.add("hidden");
}

function renderProjects(projects) {
  if (!projectsList) return;

  if (!Array.isArray(projects) || projects.length === 0) {
    projectsList.innerHTML =
      '<div class="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"><svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg><p class="mt-3 text-sm font-semibold text-slate-600">No hay proyectos registrados aún</p><p class="mt-1 text-xs text-slate-500">Agrega el primer proyecto</p></div>';
    return;
  }

  projectsList.innerHTML = projects
    .map(
      (project) => `
        <article class="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition hover:border-cyan-300 hover:shadow-lg">
          <div class="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-cyan-400 to-cyan-600"></div>
          <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 flex-1">
              <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-lg font-extrabold text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-100">
                ${String(project.nombre || "P").trim().charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-lg font-extrabold text-slate-900">${escapeHtml(project.nombre)}</h3>
                <p class="mt-0.5 truncate text-sm text-slate-600">
                  <svg class="inline h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  ${escapeHtml(project.periodo)}
                </p>
                <span class="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  ${escapeHtml(project.tipo)}
                </span>
                <p class="mt-3 text-sm text-slate-700">${escapeHtml(project.descripcion)}</p>
                
                <div class="mt-4 border-t border-slate-100 pt-3">
                  <p class="mb-2 text-xs font-semibold text-slate-500">Participantes involucrados</p>
                  <div class="flex flex-wrap gap-1">
                    ${(Array.isArray(project.participantesDetalle) && project.participantesDetalle.length > 0)
                      ? project.participantesDetalle
                        .map((participant) => `<span class="rounded bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-inset ring-cyan-500/20">${escapeHtml(participant.nombre)}</span>`)
                        .join("")
                      : '<span class="text-xs text-slate-500 italic">Sin participantes activos</span>'}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 w-full sm:w-auto flex-shrink-0">
              <button type="button" data-action="edit" data-id="${project.id}" class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:shadow-md h-fit">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </button>
              <button type="button" data-action="delete" data-id="${project.id}" class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 hover:shadow-md h-fit">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

async function loadMembersForProjects() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) throw new Error("No se pudieron cargar los miembros");
    currentMembers = await response.json();
    renderParticipantSelector(currentMembers, projectParticipantsSelector, []);
  } catch (error) {
    currentMembers = [];
    renderParticipantSelector([], projectParticipantsSelector, []);
  }
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("No se pudieron cargar los proyectos");
    currentProjects = await response.json();
    renderProjects(currentProjects);
  } catch (error) {
    if (projectsList) {
      projectsList.innerHTML =
        '<p class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error al cargar proyectos.</p>';
    }
  }
}

if (projectsList) {
  projectsList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const action = target.dataset.action;
    const projectId = Number(target.dataset.id);
    if (!action || !projectId) return;

    const project = currentProjects.find((item) => item.id === projectId);
    if (!project) {
      showProjectMessage("Proyecto no encontrado.", true);
      return;
    }

    if (action === "edit") {
      showEditModal(project);
    } else if (action === "delete") {
      showDeleteModal(project);
    }
  });
}

if (projectForm) {
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(projectForm);
    const payload = {
      nombre: String(formData.get("nombre") || "").trim(),
      tipo: String(formData.get("tipo") || "").trim(),
      periodo: String(formData.get("periodo") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim(),
      participantes: Array.from(
        projectParticipantsSelector.querySelectorAll('input[name="participantes"]:checked')
      ).map((input) => Number(input.value))
    };

    if (!payload.nombre || !payload.tipo || !payload.periodo || !payload.descripcion) {
      showProjectMessage("Completa todos los campos.", true);
      return;
    }

    if (!Array.isArray(payload.participantes) || payload.participantes.length === 0) {
      showProjectMessage("Selecciona al menos un participante inicial.", true);
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "No se pudo registrar el proyecto");

      showProjectMessage("Proyecto registrado correctamente.");
      projectForm.reset();
      await loadProjects();
    } catch (error) {
      showProjectMessage(error.message || "Error al registrar proyecto.", true);
    }
  });
}

if (editProjectForm) {
  editProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!editingProjectId) {
      showEditProjectFormMessage("No hay proyecto seleccionado para editar.", true);
      return;
    }

    const formData = new FormData(editProjectForm);
    const payload = {
      nombre: String(formData.get("nombre") || "").trim(),
      tipo: String(formData.get("tipo") || "").trim(),
      periodo: String(formData.get("periodo") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim(),
      participantes: Array.from(
        editProjectParticipantsSelector.querySelectorAll('input[name="participantes"]:checked')
      ).map((input) => Number(input.value))
    };

    if (!payload.nombre || !payload.tipo || !payload.periodo || !payload.descripcion) {
      showEditProjectFormMessage("Completa todos los campos.", true);
      return;
    }

    if (!Array.isArray(payload.participantes) || payload.participantes.length === 0) {
      showEditProjectFormMessage("Selecciona al menos un participante.", true);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${editingProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "No se pudo actualizar el proyecto");

      hideEditModal();
      showProjectMessage("Proyecto actualizado correctamente.");
      await loadProjects();
    } catch (error) {
      showEditProjectFormMessage(error.message || "Error al actualizar proyecto.", true);
    }
  });
}

if (confirmDeleteProjectButton) {
  confirmDeleteProjectButton.addEventListener("click", async () => {
    if (!deletingProjectId) return;

    try {
      const response = await fetch(`/api/projects/${deletingProjectId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        let errorMessage = "No se pudo eliminar el proyecto";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch { }
        throw new Error(errorMessage);
      }

      hideDeleteModal();
      showProjectMessage("Proyecto eliminado correctamente.");
      await loadProjects();
    } catch (error) {
       hideDeleteModal();
       showProjectMessage(error.message || "Error al eliminar proyecto.", true);
    }
  });
}

if (projectRefreshButton) projectRefreshButton.addEventListener("click", loadProjects);

if (closeEditProjectModalButton) closeEditProjectModalButton.addEventListener("click", hideEditModal);
if (cancelEditProjectModalButton) cancelEditProjectModalButton.addEventListener("click", hideEditModal);
if (editProjectModal) {
  editProjectModal.addEventListener("click", (event) => {
    if (event.target === editProjectModal) hideEditModal();
  });
}

if (closeDeleteProjectModalButton) closeDeleteProjectModalButton.addEventListener("click", hideDeleteModal);
if (cancelDeleteProjectModalButton) cancelDeleteProjectModalButton.addEventListener("click", hideDeleteModal);
if (deleteProjectModal) {
  deleteProjectModal.addEventListener("click", (event) => {
    if (event.target === deleteProjectModal) hideDeleteModal();
  });
}

loadProjects();
loadMembersForProjects();
