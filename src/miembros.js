const membersViewList = document.getElementById("membersViewList");
const refreshMembersButton = document.getElementById("refreshMembersButton");
const membersMessage = document.getElementById("membersMessage");
const addMemberButton = document.getElementById("addMemberButton");
const addMemberModal = document.getElementById("addMemberModal");
const addMemberForm = document.getElementById("addMemberForm");
const addMemberFormMessage = document.getElementById("addMemberFormMessage");
const closeAddMemberModalButton = document.getElementById("closeAddMemberModalButton");
const cancelAddMemberModalButton = document.getElementById("cancelAddMemberModalButton");
const editMemberModal = document.getElementById("editMemberModal");
const editMemberBasicForm = document.getElementById("editMemberBasicForm");
const editMemberFormMessage = document.getElementById("editMemberFormMessage");
const closeEditMemberModalButton = document.getElementById("closeEditMemberModalButton");
const cancelEditMemberModalButton = document.getElementById("cancelEditMemberModalButton");
const deleteMemberModal = document.getElementById("deleteMemberModal");
const deleteMemberModalText = document.getElementById("deleteMemberModalText");
const closeDeleteMemberModalButton = document.getElementById("closeDeleteMemberModalButton");
const cancelDeleteMemberModalButton = document.getElementById("cancelDeleteMemberModalButton");
const confirmDeleteMemberButton = document.getElementById("confirmDeleteMemberButton");

let currentMembers = [];
let editingMemberId = null;
let deletingMemberId = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitial(name) {
  return String(name || "").trim().charAt(0).toUpperCase() || "M";
}

function showMembersMessage(text, isError = false) {
  if (!membersMessage) {
    return;
  }

  membersMessage.textContent = text;
  membersMessage.className = isError
    ? "mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    : "mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";
}

function showAddFormMessage(text, isError = false) {
  if (!addMemberFormMessage) {
    return;
  }

  addMemberFormMessage.textContent = text;
  addMemberFormMessage.className = isError
    ? "rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
    : "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700";
}

function showEditFormMessage(text, isError = false) {
  if (!editMemberFormMessage) {
    return;
  }

  editMemberFormMessage.textContent = text;
  editMemberFormMessage.className = isError
    ? "rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
    : "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700";
}

function showAddModal() {
  if (!addMemberModal || !addMemberForm) {
    return;
  }

  addMemberForm.reset();
  showAddFormMessage("", false);
  addMemberModal.classList.remove("hidden");
  addMemberModal.classList.add("flex");
  document.getElementById("addMemberNombre")?.focus();
}

function hideAddModal() {
  if (!addMemberModal || !addMemberForm) {
    return;
  }

  addMemberForm.reset();
  showAddFormMessage("", false);
  addMemberModal.classList.add("hidden");
  addMemberModal.classList.remove("flex");
}

function showEditModal(member) {
  if (!editMemberModal || !editMemberBasicForm) {
    return;
  }

  editingMemberId = member.id;
  editMemberBasicForm.nombre.value = member.nombre;
  editMemberBasicForm.correo.value = member.correo;
  editMemberBasicForm.rol.value = member.rol;
  showEditFormMessage("", false);
  editMemberModal.classList.remove("hidden");
  editMemberModal.classList.add("flex");
  editMemberBasicForm.nombre.focus();
}

function hideEditModal() {
  if (!editMemberModal || !editMemberBasicForm) {
    return;
  }

  editingMemberId = null;
  editMemberBasicForm.reset();
  showEditFormMessage("", false);
  editMemberModal.classList.add("hidden");
  editMemberModal.classList.remove("flex");
}

function showDeleteModal(member) {
  if (!deleteMemberModal || !deleteMemberModalText) {
    return;
  }

  deletingMemberId = member.id;
  deleteMemberModalText.textContent = `Seguro que deseas eliminar a ${member.nombre}?`;
  deleteMemberModal.classList.remove("hidden");
  deleteMemberModal.classList.add("flex");
}

function hideDeleteModal() {
  if (!deleteMemberModal) {
    return;
  }

  deletingMemberId = null;
  deleteMemberModal.classList.add("hidden");
  deleteMemberModal.classList.remove("flex");
}

function renderMembers(members) {
  if (!membersViewList) {
    return;
  }

  if (!Array.isArray(members) || members.length === 0) {
    membersViewList.innerHTML =
      '<div class="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"><svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg><p class="mt-3 text-sm font-semibold text-slate-600">No hay miembros registrados aún</p><p class="mt-1 text-xs text-slate-500">Agrega el primer miembro al equipo</p></div>';
    return;
  }

  membersViewList.innerHTML = members
    .map(
      (member) => `
        <article class="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition hover:border-cyan-300 hover:shadow-lg">
          <div class="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-cyan-400 to-cyan-600"></div>
          <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-lg font-extrabold text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-100">
                ${getInitial(member.nombre)}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-lg font-extrabold text-slate-900">${escapeHtml(member.nombre)}</h3>
                <p class="mt-0.5 truncate text-sm text-slate-600">
                  <svg class="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  ${escapeHtml(member.correo)}
                </p>
                <span class="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  ${escapeHtml(member.rol)}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 sm:flex-nowrap">
              <button type="button" data-action="edit" data-id="${member.id}" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:shadow-md sm:flex-initial">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </button>
              <button type="button" data-action="delete" data-id="${member.id}" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 hover:shadow-md sm:flex-initial">
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

async function loadMembers() {
  try {
    const response = await fetch("/api/members");
    if (!response.ok) {
      throw new Error("No se pudieron cargar los miembros");
    }
    const members = await response.json();
    currentMembers = members;
    renderMembers(members);
  } catch (error) {
    if (membersViewList) {
      membersViewList.innerHTML =
        '<p class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error al cargar miembros.</p>';
    }
  }
}

if (membersViewList) {
  membersViewList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const action = target.dataset.action;
    const memberId = Number(target.dataset.id);
    if (!action || !memberId) {
      return;
    }

    const member = currentMembers.find((item) => item.id === memberId);
    if (!member) {
      showMembersMessage("Miembro no encontrado.", true);
      return;
    }

    if (action === "edit") {
      showEditModal(member);
      return;
    }

    if (action === "delete") {
      showDeleteModal(member);
    }
  });
}

if (editMemberBasicForm) {
  editMemberBasicForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!editingMemberId) {
      showEditFormMessage("No hay miembro seleccionado para editar.", true);
      return;
    }

    const formData = new FormData(editMemberBasicForm);
    const payload = {
      nombre: String(formData.get("nombre") || "").trim(),
      correo: String(formData.get("correo") || "").trim(),
      rol: String(formData.get("rol") || "").trim()
    };

    if (!payload.nombre || !payload.correo || !payload.rol) {
      showEditFormMessage("Completa todos los campos.", true);
      return;
    }

    try {
      const response = await fetch(`/api/members/${editingMemberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo actualizar el miembro");
      }

      hideEditModal();
      showMembersMessage("Miembro actualizado correctamente.");
      await loadMembers();
    } catch (error) {
      showEditFormMessage(error.message || "Error al actualizar miembro.", true);
    }
  });
}

if (addMemberButton) {
  addMemberButton.addEventListener("click", showAddModal);
}

if (addMemberForm) {
  addMemberForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(addMemberForm);
    const payload = {
      nombre: String(formData.get("nombre") || "").trim(),
      correo: String(formData.get("correo") || "").trim(),
      rol: String(formData.get("rol") || "").trim()
    };

    if (!payload.nombre || !payload.correo || !payload.rol) {
      showAddFormMessage("Completa todos los campos.", true);
      return;
    }

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo agregar el miembro");
      }

      hideAddModal();
      showMembersMessage("Miembro agregado correctamente.");
      await loadMembers();
    } catch (error) {
      showAddFormMessage(error.message || "Error al agregar miembro.", true);
    }
  });
}

if (closeAddMemberModalButton) {
  closeAddMemberModalButton.addEventListener("click", hideAddModal);
}

if (cancelAddMemberModalButton) {
  cancelAddMemberModalButton.addEventListener("click", hideAddModal);
}

if (addMemberModal) {
  addMemberModal.addEventListener("click", (event) => {
    if (event.target === addMemberModal) {
      hideAddModal();
    }
  });
}

if (refreshMembersButton) {
  refreshMembersButton.addEventListener("click", loadMembers);
}

if (closeEditMemberModalButton) {
  closeEditMemberModalButton.addEventListener("click", hideEditModal);
}

if (cancelEditMemberModalButton) {
  cancelEditMemberModalButton.addEventListener("click", hideEditModal);
}

if (editMemberModal) {
  editMemberModal.addEventListener("click", (event) => {
    if (event.target === editMemberModal) {
      hideEditModal();
    }
  });
}

if (confirmDeleteMemberButton) {
  confirmDeleteMemberButton.addEventListener("click", async () => {
    if (!deletingMemberId) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${deletingMemberId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        let errorMessage = "No se pudo eliminar el miembro";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = "No se pudo eliminar el miembro";
        }
        throw new Error(errorMessage);
      }

      hideDeleteModal();
      showMembersMessage("Miembro eliminado correctamente.");
      await loadMembers();
    } catch (error) {
      showMembersMessage(error.message || "Error al eliminar miembro.", true);
    }
  });
}

if (closeDeleteMemberModalButton) {
  closeDeleteMemberModalButton.addEventListener("click", hideDeleteModal);
}

if (cancelDeleteMemberModalButton) {
  cancelDeleteMemberModalButton.addEventListener("click", hideDeleteModal);
}

if (deleteMemberModal) {
  deleteMemberModal.addEventListener("click", (event) => {
    if (event.target === deleteMemberModal) {
      hideDeleteModal();
    }
  });
}

loadMembers();
