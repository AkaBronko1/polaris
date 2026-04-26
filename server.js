const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use("/src", express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname)));

const members = [];
let nextId = 1;
const projects = [];
let nextProjectId = 1;

function validateMemberInput(payload) {
  const nombre = String(payload?.nombre || "").trim();
  const correo = String(payload?.correo || "").trim();
  const rol = String(payload?.rol || "").trim();

  if (!nombre || !correo || !rol) {
    return { ok: false, message: "nombre, correo y rol son obligatorios" };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(correo)) {
    return { ok: false, message: "correo invalido" };
  }

  return { ok: true, value: { nombre, correo, rol } };
}

function validateProjectInput(payload) {
  const nombre = String(payload?.nombre || "").trim();
  const tipo = String(payload?.tipo || "").trim();
  const periodo = String(payload?.periodo || "").trim();
  const descripcion = String(payload?.descripcion || "").trim();
  const rawParticipantes = Array.isArray(payload?.participantes)
    ? payload.participantes
    : [];

  const participantes = [...new Set(rawParticipantes.map((id) => Number(id)))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (!nombre || !tipo || !periodo || !descripcion) {
    return {
      ok: false,
      message: "nombre, tipo, periodo y descripcion son obligatorios"
    };
  }

  if (participantes.length === 0) {
    return {
      ok: false,
      message: "debes seleccionar participantes iniciales"
    };
  }

  const memberIds = new Set(members.map((member) => member.id));
  const invalidParticipants = participantes.filter((id) => !memberIds.has(id));
  if (invalidParticipants.length > 0) {
    return {
      ok: false,
      message: "hay participantes que no existen"
    };
  }

  return {
    ok: true,
    value: {
      nombre,
      tipo,
      periodo,
      descripcion,
      participantes
    }
  };
}

function mapProjectForResponse(project) {
  const participantesDetalle = project.participantes
    .map((participantId) => members.find((member) => member.id === participantId))
    .filter(Boolean)
    .map((member) => ({
      id: member.id,
      nombre: member.nombre,
      rol: member.rol
    }));

  return {
    ...project,
    participantesDetalle
  };
}

app.get("/api/members", (req, res) => {
  res.json(members);
});

app.post("/api/members", (req, res) => {
  const validation = validateMemberInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const member = {
    id: nextId,
    nombre: validation.value.nombre,
    correo: validation.value.correo,
    rol: validation.value.rol,
    creadoEn: new Date().toISOString()
  };

  nextId += 1;
  members.push(member);
  return res.status(201).json(member);
});

app.get("/api/projects", (req, res) => {
  const payload = projects.map((project) => mapProjectForResponse(project));
  res.json(payload);
});

app.post("/api/projects", (req, res) => {
  const validation = validateProjectInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const project = {
    id: nextProjectId,
    nombre: validation.value.nombre,
    tipo: validation.value.tipo,
    periodo: validation.value.periodo,
    descripcion: validation.value.descripcion,
    participantes: validation.value.participantes,
    creadoEn: new Date().toISOString()
  };

  nextProjectId += 1;
  projects.push(project);
  return res.status(201).json(mapProjectForResponse(project));
});

app.put("/api/projects/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const projectIndex = projects.findIndex((project) => project.id === projectId);

  if (projectIndex === -1) {
    return res.status(404).json({ message: "proyecto no encontrado" });
  }

  const validation = validateProjectInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  projects[projectIndex] = {
    ...projects[projectIndex],
    nombre: validation.value.nombre,
    tipo: validation.value.tipo,
    periodo: validation.value.periodo,
    descripcion: validation.value.descripcion,
    participantes: validation.value.participantes,
    actualizadoEn: new Date().toISOString()
  };

  return res.json(mapProjectForResponse(projects[projectIndex]));
});

app.delete("/api/projects/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const projectIndex = projects.findIndex((project) => project.id === projectId);

  if (projectIndex === -1) {
    return res.status(404).json({ message: "proyecto no encontrado" });
  }

  projects.splice(projectIndex, 1);
  return res.status(204).send();
});

app.put("/api/members/:id", (req, res) => {
  const memberId = Number(req.params.id);
  const memberIndex = members.findIndex((member) => member.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ message: "miembro no encontrado" });
  }

  const validation = validateMemberInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  members[memberIndex] = {
    ...members[memberIndex],
    nombre: validation.value.nombre,
    correo: validation.value.correo,
    rol: validation.value.rol,
    actualizadoEn: new Date().toISOString()
  };

  return res.json(members[memberIndex]);
});

app.delete("/api/members/:id", (req, res) => {
  const memberId = Number(req.params.id);
  const memberIndex = members.findIndex((member) => member.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ message: "miembro no encontrado" });
  }

  members.splice(memberIndex, 1);

  for (const project of projects) {
    project.participantes = project.participantes.filter(
      (participantId) => participantId !== memberId
    );
  }

  return res.status(204).send();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/registro.html", (req, res) => {
  res.sendFile(path.join(__dirname, "registro.html"));
});

app.get("/proyectos.html", (req, res) => {
  res.sendFile(path.join(__dirname, "proyectos.html"));
});

app.get("/miembros.html", (req, res) => {
  res.sendFile(path.join(__dirname, "miembros.html"));
});

app.listen(PORT, () => {
  console.log(`POLARIS ejecutandose en http://localhost:${PORT}`);
});
