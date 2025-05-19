// Variables globales
const coloresBase = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#AB47BC'];
let elementosRuleta = [];
let elementosOcultos = [];
let anguloActual = 0;
let girando = false;
let modoEdicion = false;
let ultimoElementoSeleccionado = null;

// Elementos del DOM
const ruletaElemento = document.getElementById('ruleta');
const textareaElemento = document.getElementById('elementosTextarea');
const mensajeElemento = document.getElementById('mensaje');
const respuestaElemento = document.getElementById('respuesta');
const btnIniciar = document.getElementById('btnIniciar');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnEditar = document.getElementById('btnEditar');
const btnEsconder = document.getElementById('btnEsconder');

// F2: Función para obtener elementos del textarea
function obtenerElementosDesdeTextarea() {
    const texto = textareaElemento.value;
    return texto.split('\n').filter(elemento => elemento.trim() !== '');
}

// F3: Función para dibujar la ruleta
function dibujarRuleta() {
    // Limpiar la ruleta
    ruletaElemento.innerHTML = '';

    // Obtener los elementos activos (no ocultos)
    elementosRuleta = obtenerElementosDesdeTextarea().filter(
        elemento => !elementosOcultos.includes(elemento)
    );

    if (elementosRuleta.length === 0) {
        mensajeElemento.textContent = 'No hay elementos para mostrar';
        return;
    }

    // Crear un SVG para dibujar la ruleta
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "-50 -50 100 100");

    // Calcular el ángulo para cada sector
    const anguloPorSector = 360 / elementosRuleta.length;

    // Crear cada sector de la ruleta como un path SVG
    elementosRuleta.forEach((elemento, index) => {
        const inicioAngulo = index * anguloPorSector;
        const finAngulo = (index + 1) * anguloPorSector;

        // Convertir ángulos a radianes
        const inicioRad = (inicioAngulo - 90) * Math.PI / 180;
        const finRad = (finAngulo - 90) * Math.PI / 180;

        // Calcular coordenadas
        const x1 = 50 * Math.cos(inicioRad);
        const y1 = 50 * Math.sin(inicioRad);
        const x2 = 50 * Math.cos(finRad);
        const y2 = 50 * Math.sin(finRad);

        // Crear path para el sector
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Definir el path (M: mover a, L: línea a, A: arco elíptico, Z: cerrar path)
        const d = `M 0 0 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

        path.setAttribute("d", d);
        path.setAttribute("fill", coloresBase[index % coloresBase.length]);

        svg.appendChild(path);

        // Añadir el texto
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");

        // Calcular posición del texto
        const anguloMedio = (inicioAngulo + finAngulo) / 2;
        const anguloMedioRad = (anguloMedio - 90) * Math.PI / 180;
        const distanciaTexto = 30; // Distancia desde el centro

        const textoX = distanciaTexto * Math.cos(anguloMedioRad);
        const textoY = distanciaTexto * Math.sin(anguloMedioRad);

        texto.setAttribute("x", textoX);
        texto.setAttribute("y", textoY);
        texto.setAttribute("font-size", "8");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "middle");
        texto.setAttribute("transform", `rotate(${anguloMedio} ${textoX} ${textoY})`);
        texto.textContent = elemento;

        svg.appendChild(texto);
    });

    ruletaElemento.appendChild(svg);
    mensajeElemento.textContent = 'haz clic para girarlo';
}

// F1: Función para girar la ruleta
function girarRuleta() {
    if (girando || elementosRuleta.length === 0) return;

    girando = true;
    mensajeElemento.textContent = 'Girando...';

    // Generar un número aleatorio de vueltas (¡AUMENTADO!)
    const vueltas = 5 + Math.random() * 5;  // Ahora entre 5 y 10 vueltas

    // Generar un ángulo aleatorio final (0-360)
    const anguloFinal = Math.floor(Math.random() * 360);

    // Calcular la rotación total
    const rotacionTotal = vueltas * 360 + anguloFinal;

    // Animar la ruleta
    ruletaElemento.style.transition = 'transform 3s cubic-bezier(0.2, 0.1, 0.1, 1)';
    ruletaElemento.style.transform = `rotate(${rotacionTotal}deg)`;

    // Actualizar el ángulo actual
    anguloActual = rotacionTotal % 360;

    // Esperar a que termine la animación
    setTimeout(() => {
        girando = false;
        ruletaElemento.style.transition = 'none';

        // Calcular qué elemento ha sido seleccionado
        const anguloPorSector = 360 / elementosRuleta.length;
        const sectorSeleccionado = Math.floor(((360 - (anguloActual % 360) + 90) % 360) / anguloPorSector);

        // Obtener el elemento seleccionado
        ultimoElementoSeleccionado = elementosRuleta[sectorSeleccionado];

        // Mostrar el resultado
        mensajeElemento.textContent = 'haz clic para girarlo';
        respuestaElemento.textContent = `Elemento seleccionado: ${ultimoElementoSeleccionado}`;
    }, 3000); // El tiempo de la transicion es de 3 segundos, se mantiene igual
}
// F5 y F6: Función para actualizar la ruleta cuando cambia el textarea
function actualizarRuletaPorCambios() {
    if (!modoEdicion) {
        dibujarRuleta();
    }
}

// F7: Función para habilitar/deshabilitar el modo edición
function toggleModoEdicion() {
    modoEdicion = !modoEdicion;
    textareaElemento.readOnly = !modoEdicion;

    if (modoEdicion) {
        textareaElemento.focus();
        btnEditar.textContent = 'Guardar';
    } else {
        btnEditar.textContent = 'Editar';
        actualizarRuletaPorCambios();
    }
}

// F8: Función para reiniciar la ruleta
function reiniciarRuleta() {
    elementosOcultos = [];

    // Restaurar el estado original del textarea (quitar resaltados)
    const lineas = textareaElemento.value.split('\n');
    textareaElemento.value = lineas.join('\n');

    // Redibujar la ruleta
    dibujarRuleta();

    // Limpiar el resultado
    respuestaElemento.textContent = '';
    ultimoElementoSeleccionado = null;
}

// F9: Función para pantalla completa
function togglePantallaCompleta() {
    const container = document.querySelector('.container');

    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }

        container.classList.add('fullscreen');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        container.classList.remove('fullscreen');
    }
}

// F7: Función para ocultar el elemento seleccionado
function ocultarElementoSeleccionado() {
    if (!ultimoElementoSeleccionado) return;

    // Agregar a la lista de elementos ocultos
    if (!elementosOcultos.includes(ultimoElementoSeleccionado)) {
        elementosOcultos.push(ultimoElementoSeleccionado);
    }

    // Resaltar en el textarea
    const lineas = textareaElemento.value.split('\n');
    const nuevoTexto = lineas.map(linea => {
        if (linea.trim() === ultimoElementoSeleccionado) {
            return `${linea}`;
        }
        return linea;
    }).join('\n');

    // Resaltar visualmente en el DOM (ya que no podemos modificar directamente el estilo del textarea)
    textareaElemento.value = nuevoTexto;

    // Redibujar la ruleta
    dibujarRuleta();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la ruleta
    dibujarRuleta();

    // F1: Listener para girar la ruleta al hacer clic en ella
    ruletaElemento.addEventListener('click', girarRuleta);
    mensajeElemento.addEventListener('click', girarRuleta);
    btnIniciar.addEventListener('click', girarRuleta);

    // F4: Listener para cambios en el textarea
    textareaElemento.addEventListener('input', () => {
        if (!modoEdicion) {
            actualizarRuletaPorCambios();
        }
    });

    // F7: Listener para editar el textarea
    textareaElemento.addEventListener('click', () => {
        if (!modoEdicion) {
            toggleModoEdicion();
        }
    });

    btnEditar.addEventListener('click', toggleModoEdicion);

    // F8: Listener para reiniciar
    btnReiniciar.addEventListener('click', reiniciarRuleta);

    // Listener para eventos de teclado
    document.addEventListener('keydown', (e) => {
        // F1: Spacebar para girar la ruleta
        if (e.code === 'Space') {
            e.preventDefault();
            girarRuleta();
        }

        // F7: Tecla E para entrar en modo edición
        if (e.key === 'e' || e.key === 'E') {
            toggleModoEdicion();
        }

        // F8: Tecla R para reiniciar
        if (e.key === 'r' || e.key === 'R') {
            reiniciarRuleta();
        }

        // F9: Tecla F para pantalla completa
        if (e.key === 'f' || e.key === 'F') {
            togglePantallaCompleta();
        }

        // F6: Tecla S para ocultar el elemento seleccionado
        if (e.key === 's' || e.key === 'S') {
            ocultarElementoSeleccionado();
        }
    });
});