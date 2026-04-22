const membersViewList = document.getElementById("membersViewList");
const refreshMembersButton = document.getElementById("refreshMembersButton");
const membersMessage = document.getElementById("membersMessage");
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
    ? "mb-3 text-sm text-rose-600"
    : "mb-3 text-sm text-emerald-700";
}

function showEditFormMessage(text, isError = false) {
  if (!editMemberFormMessage) {
    return;
  }

  editMemberFormMessage.textContent = text;
  editMemberFormMessage.className = isError
    ? "text-sm text-rose-600"
    : "text-sm text-emerald-700";
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
      '<p class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No hay miembros registrados aun.</p>';
    return;
  }

  membersViewList.innerHTML = members
    .map(
      (member) => `
        <article class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:grid-cols-12 sm:items-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">${getInitial(member.nombre)}</div>
          <h3 class="min-w-0 truncate font-extrabold text-slate-900 sm:col-span-4">${escapeHtml(member.nombre)}</h3>
          <p class="min-w-0 truncate text-sm text-slate-600 sm:col-span-4">${escapeHtml(member.correo)}</p>
          <span class="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:col-span-2 sm:justify-self-end">${escapeHtml(member.rol)}</span>
          <div class="flex flex-wrap gap-2 sm:col-span-1 sm:justify-self-end">
            <button type="button" data-action="edit" data-id="${member.id}" class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Editar</button>
            <button type="button" data-action="delete" data-id="${member.id}" class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Eliminar</button>
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
