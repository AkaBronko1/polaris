const projectForm = document.getElementById("projectForm");
const projectMessage = document.getElementById("projectMessage");
const projectRefreshButton = document.getElementById("projectRefreshButton");
const projectsList = document.getElementById("projectsList");
const projectParticipantsSelector = document.getElementById("projectParticipantsSelector");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showProjectMessage(text, isError = false) {
  if (!projectMessage) {
    return;
  }

  projectMessage.textContent = text;
  projectMessage.className = isError
    ? "mt-3 text-sm text-rose-600"
    : "mt-3 text-sm text-emerald-700";
}

function renderParticipantSelector(members) {
  if (!projectParticipantsSelector) {
    return;
  }

  if (!Array.isArray(members) || members.length === 0) {
    projectParticipantsSelector.innerHTML =
      '<p class="text-sm text-slate-500">No hay miembros registrados. Primero registra miembros en la pagina de registro.</p>';
    return;
  }

  projectParticipantsSelector.innerHTML = members
    .map(
      (member) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-cyan-300">
          <input type="checkbox" name="participantes" value="${member.id}" class="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500">
          <span class="min-w-0 truncate text-sm font-semibold text-slate-700">${escapeHtml(member.nombre)}</span>
          <span class="ml-auto rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">${escapeHtml(member.rol)}</span>
        </label>
      `
    )
    .join("");
}

function renderProjects(projects) {
  if (!projectsList) {
    return;
  }

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
    if (!response.ok) {
      throw new Error("No se pudieron cargar los miembros");
    }

    const members = await response.json();
    renderParticipantSelector(members);
  } catch (error) {
    renderParticipantSelector([]);
  }
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error("No se pudieron cargar los proyectos");
    }
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    if (projectsList) {
      projectsList.innerHTML =
        '<p class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error al cargar proyectos.</p>';
    }
  }
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo registrar el proyecto");
      }

      showProjectMessage("Proyecto registrado correctamente.");
      projectForm.reset();
      await loadMembersForProjects();
      await loadProjects();
    } catch (error) {
      showProjectMessage(error.message || "Error al registrar proyecto.", true);
    }
  });
}

if (projectRefreshButton) {
  projectRefreshButton.addEventListener("click", loadProjects);
}

loadProjects();
loadMembersForProjects();
