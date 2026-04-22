const formRegistro = document.getElementById("formularioRegistro");
const mensajesFormulario = document.getElementById("mensajesFormulario");

function showFormMessage(text, isError = false) {
  if (!mensajesFormulario) {
    return;
  }

  mensajesFormulario.textContent = text;
  mensajesFormulario.classList.remove("hidden");
  mensajesFormulario.className = isError
    ? "rounded-lg border border-rose-300 bg-rose-50/90 p-3 text-sm text-rose-700"
    : "rounded-lg border border-emerald-300 bg-emerald-50/90 p-3 text-sm text-emerald-700";
}

if (formRegistro) {
  formRegistro.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!formRegistro.reportValidity()) {
      showFormMessage("Revisa los campos obligatorios del formulario.", true);
      return;
    }

    const formData = new FormData(formRegistro);
    const nombre = String(formData.get("nombreCompleto") || "").trim();
    const correo = String(formData.get("correo") || "").trim();
    const tipoParticipacion = String(formData.get("tipoParticipacion") || "").trim();
    const rolActual = String(formData.get("rolActual") || "").trim();

    const rol = rolActual || tipoParticipacion || "participante";

    const payload = {
      nombre,
      correo,
      rol
    };

    if (!payload.nombre || !payload.correo || !payload.rol) {
      showFormMessage("No fue posible preparar el registro de miembro.", true);
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
        throw new Error(result.message || "No se pudo guardar el registro");
      }

      showFormMessage("Registro guardado correctamente. Ya puedes verlo en Miembros.");
      formRegistro.reset();
    } catch (error) {
      showFormMessage(error.message || "Error al guardar el registro.", true);
    }
  });
}
