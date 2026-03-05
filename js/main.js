let destinos = [];
let historial = JSON.parse(localStorage.getItem("historialPro")) || [];

const formContainer = document.getElementById("formContainer");
const resultado = document.getElementById("resultado");
const historialDiv = document.getElementById("historial");

fetch("./json/destinos.json")
  .then(res => res.json())
  .then(data => {
    destinos = data;
    renderFormulario();
    renderDestinos();
    renderHistorial();
  });

function renderFormulario() {
  formContainer.innerHTML = `
    <div class="form-group">
      <label>Destino</label>
      <select id="destino"></select>
    </div>

    <div class="form-group">
      <label>Categoría</label>
      <select id="categoria">
        <option value="economico">Económico</option>
        <option value="lujo">Lujo</option>
      </select>
    </div>

    <div class="form-group">
      <label>Cantidad de personas</label>
      <input type="number" id="personas" min="1" value="1">
    </div>

    <div class="form-group">
      <label>Cantidad de noches</label>
      <input type="number" id="noches" min="1" value="3">
    </div>

    <div class="form-group">
      <label>Fecha de viaje</label>
      <input type="date" id="fechaViaje">
    </div>

    <button id="cotizarBtn">Cotizar ahora</button>
    <button id="borrarHistorialBtn" class="btn-borrar">Borrar historial</button>
  `;

  document
    .getElementById("cotizarBtn")
    .addEventListener("click", calcularCotizacion);
  document
    .getElementById("borrarHistorialBtn")
    .addEventListener("click", borrarHistorial);
   
}

function renderDestinos() {
  const select = document.getElementById("destino");

  select.innerHTML = `
    <option value="">Seleccione destino</option>
    ${destinos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join("")}
  `;
}

function calcularCotizacion() {
  const destinoId = Number(document.getElementById("destino").value);
  const noches = Number(document.getElementById("noches").value);
  const personas = Number(document.getElementById("personas").value);
  const fecha = document.getElementById("fechaViaje").value;
  const categoria = document.getElementById("categoria").value;

  if (!destinoId || noches <= 0 || personas <= 0 || !fecha) {
    Swal.fire("Error", "Completá todos los campos", "error");
    return;
  }

  const destino = destinos.find(d => d.id === destinoId);

  let precio = destino.precioBase;

  if (categoria === "lujo") {
    precio *= 1.6;
  }

  const subtotal = precio * noches * personas;
  const impuestos = subtotal * 0.21;
  const totalFinal = subtotal + impuestos;

  const idCotizacion = "TQ-" + Date.now();

  mostrarResultado({
    idCotizacion,
    destino: destino.nombre,
    fecha: formatearFecha(fecha),
    noches,
    personas,
    subtotal,
    impuestos,
    totalFinal
  });

  guardarHistorial(idCotizacion, destino.nombre, totalFinal, fecha);
}

function mostrarResultado(data) {
  resultado.innerHTML = `
    <div class="resultado-card">
      <h2>✨ Cotización ${data.idCotizacion}</h2>
      <p><strong>Destino:</strong> ${data.destino}</p>
      <p><strong>Fecha:</strong> ${data.fecha}</p>
      <p>${data.personas} personas | ${data.noches} noches</p>

      <div class="desglose">
        <p>Subtotal: $${data.subtotal.toFixed(2)}</p>
        <p>Impuestos: $${data.impuestos.toFixed(2)}</p>
      </div>

      <h1 class="total-final">$${data.totalFinal.toFixed(2)}</h1>
    </div>
  `;
}

function guardarHistorial(id, destino, total, fecha) {
  const nueva = { id, destino, total, fecha };
  historial.push(nueva);

  localStorage.setItem("historialPro", JSON.stringify(historial));

  renderHistorial();
}

function renderHistorial() {
  historialDiv.innerHTML = historial
    .map(h => `
      <div class="historial-item">
        <strong>${h.id}</strong>
        <p>${h.destino}</p>
        <p>${formatearFecha(h.fecha)}</p>
        <p>$${h.total.toFixed(2)}</p>
      </div>
    `)
    .join("");
}

function formatearFecha(fecha) {
  const opciones = { day: "2-digit", month: "long", year: "numeric" };
  return new Date(fecha).toLocaleDateString("es-AR", opciones);
}

function borrarHistorial() {

  Swal.fire({
    title: "¿Borrar historial?",
    text: "Esta acción eliminará todas las cotizaciones",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar"
  }).then((result) => {

    if (result.isConfirmed) {

      historial = [];

      localStorage.removeItem("historialPro");

      renderHistorial();

      Swal.fire(
        "Historial eliminado",
        "Las cotizaciones fueron borradas",
        "success"
      );

    }

  });

}