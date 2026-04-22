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
          <input type="checkbox" name="participantes" value="${member.id}" ${selectedIds.includes(member.id) ? "checked" : ""} class="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500">
          <span class="min-w-0 truncate text-sm font-semibold text-slate-700">${escapeHtml(member.nombre)}</span>
          <span class="ml-auto rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">${escapeHtml(member.rol)}</span>
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
  editProjectModal.classList.add("flex");
  editProjectForm.nombre.focus();
}

function hideEditModal() {
  if (!editProjectModal || !editProjectForm) return;

  editingProjectId = null;
  editProjectForm.reset();
  showEditProjectFormMessage("", false);
  editProjectModal.classList.add("hidden");
  editProjectModal.classList.remove("flex");
}

function showDeleteModal(project) {
  if (!deleteProjectModal || !deleteProjectModalText) return;

  deletingProjectId = project.id;
  deleteProjectModalText.textContent = `Seguro que deseas eliminar el proyecto: ${project.nombre}?`;
  deleteProjectModal.classList.remove("hidden");
  deleteProjectModal.classList.add("flex");
}

function hideDeleteModal() {
  if (!deleteProjectModal) return;

  deletingProjectId = null;
  deleteProjectModal.classList.add("hidden");
  deleteProjectModal.classList.remove("flex");
}

function renderProjects(projects) {
  if (!projectsList) return;

  if (!Array.isArray(projects) || projects.length === 0) {
    projectsList.innerHTML =
      '<p class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No hay proyectos registrados aun.</p>';
    return;
  }

  projectsList.innerHTML = projects
    .map(
      (project) => `
        <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-lg font-extrabold text-slate-900">${escapeHtml(project.nombre)}</h3>
            <span class="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">${escapeHtml(project.tipo)}</span>
            <div class="ml-auto flex gap-2">
              <button type="button" data-action="edit" data-id="${project.id}" class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Editar</button>
              <button type="button" data-action="delete" data-id="${project.id}" class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Eliminar</button>
            </div>
          </div>
          <p class="mt-2 text-sm font-semibold text-slate-600">Periodo: ${escapeHtml(project.periodo)}</p>
          <p class="mt-2 text-sm text-slate-700">${escapeHtml(project.descripcion)}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${(Array.isArray(project.participantesDetalle) && project.participantesDetalle.length > 0)
              ? project.participantesDetalle
                .map((participant) => `<span class="rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">${escapeHtml(participant.nombre)}</span>`)
                .join(" ")
              : '<span class="text-xs text-slate-500">Sin participantes activos</span>'}
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
