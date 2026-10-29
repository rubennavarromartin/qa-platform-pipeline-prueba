/*
|--------------------------------------------------------------------------
| Vehículos — el alta en un panel a pantalla completa
|--------------------------------------------------------------------------
|
| El alta no se abre con `Modal`, que es lo que usan todas las demás
| pantallas: se abre en un panel que ocupa la pantalla entera, dentro de un
| contenedor propio colgado al final del documento. Es como lo hace
| AUTOSTOCKNUVEX con el CDK de Angular, y el porqué de traerlo aquí está en
| `vehiculos.html`.
|
| Lo que se copia, porque es lo que hace la pregunta:
|
|   - un contenedor fijo al final de <body>, vacío hasta que se abre algo;
|   - dentro, un fondo y un panel, y el panel es un elemento con nombre
|     propio —`lab-vehiculo-nuevo`—, como los componentes de Angular;
|   - ni `role="dialog"`, ni `aria-modal`, ni ninguna clase que diga modal.
|
| Lo que no se copia, porque no hace falta para preguntar: que el contenido
| de debajo se quede inerte. Se cierra con Escape, con "Cancelar" y con la
| cruz, que son las tres maneras que tiene el de verdad.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const cuerpo =
        document.querySelector("#vehiculosGrid tbody");

    const vacio =
        document.getElementById("vehiculosVacio");

    const buscador =
        document.getElementById("search");

    const boton =
        document.getElementById("btnNuevoVehiculo");

    if (!cuerpo) {

        return;

    }

    Vehiculos.load();

    const paginacion =
        Pagination.crear({
            id: "paginacion",
            onCambio: pintar
        });

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function fila(uno) {

        return `
<tr data-id="${uno.id}">
    <td>${escapar(uno.matricula)}</td>
    <td>${escapar(uno.flota)}</td>
    <td>${escapar(uno.marca)}</td>
    <td>${escapar(uno.modelo)}</td>
    <td>${escapar(uno.matriculacion)}</td>
</tr>
`;

    }

    function pintar() {

        const todos =
            Vehiculos.search(buscador?.value);

        const suyos =
            paginacion
                ? paginacion.recortar(todos)
                : todos;

        cuerpo.innerHTML =
            suyos.map(fila).join("");

        if (vacio) {

            vacio.textContent =
                todos.length
                    ? ""
                    : "No hay vehículos que coincidan con la búsqueda.";

        }

    }

    /*
    * El contenedor de los paneles. Se crea vacío al cargar, como el del CDK,
    * y se queda en el documento: lo que entra y sale es lo de dentro.
    */

    const capa =
        document.createElement("div");

    capa.className = "capaDePaneles";

    document.body.appendChild(capa);

    function cerrarElPanel() {

        capa.innerHTML = "";

        /*
        * Y la lista de un desplegable, que no vive dentro del panel sino
        * fuera, como en la aplicación de verdad.
        */

        document.querySelectorAll(".desplegableLista").forEach(una => una.remove());

        document.removeEventListener("keydown", conEscape);

        boton?.focus();

    }

    function conEscape(evento) {

        if (evento.key === "Escape") {

            cerrarElPanel();

        }

    }

    function abrirElAlta() {

        capa.innerHTML = `
<div class="capaFondo"></div>
<div class="capaPanel">
    <lab-vehiculo-nuevo class="panelCompleto">
        <header class="panelCabecera">
            <h2>Nuevo vehículo</h2>
            <button type="button" class="panelCruz" id="btnCerrarPanel" aria-label="Cerrar">×</button>
        </header>
        <form id="formVehiculo" class="formulario">
            <div class="vehiculoPaso" data-paso="1">
                <p class="muted">1. Identificación</p>
                <div class="campo">
                    <label for="matricula">Matrícula *</label>
                    <!--
                    | Diez caracteres como mucho, como la de AUTOSTOCKNUVEX: el
                    | navegador corta en silencio lo que pase.
                    -->
                    <input id="matricula" name="matricula" type="text" maxlength="10" required>
                </div>
                <div class="campo">
                    <label for="flota">Código de flota *</label>
                    <input id="flota" name="flota" type="text" required>
                </div>
                <div class="campo">
                    <!--
                    | Opcional y con formato: diecisiete caracteres sin I, O ni
                    | Q. Mal escrito apaga "Siguiente" y lo dice debajo, como el
                    | Bastidor de AUTOSTOCKNUVEX, que dejaba la prueba de alta
                    | esperando a un botón que no se iba a encender.
                    -->
                    <label for="bastidor">Bastidor</label>
                    <input id="bastidor" name="bastidor" type="text">
                    <small class="campoError" id="bastidorError" hidden>Bastidor no válido: diecisiete caracteres, sin I, O ni Q.</small>
                </div>
                <div class="campo">
                    <label for="marca">Marca *</label>
                    <input id="marca" name="marca" type="text" required>
                </div>
                <div class="campo">
                    <div class="desplegablePropio" tabindex="0">
                        <label>Propósito:<span class="obligatorio"> *</span></label>
                        <span class="desplegableValor" data-valor="">Elige uno</span>
                    </div>
                </div>
            </div>
            <div class="vehiculoPaso" data-paso="2" hidden>
                <p class="muted">2. Detalles</p>
                <div class="campo">
                    <!--
                    | Sin id, sin name y sin estar asociado a su etiqueta, como
                    | todos los campos de AUTOSTOCKNUVEX: un label y, a su lado,
                    | el input. Ni getByLabel lo encuentra; sólo se le puede
                    | señalar por la etiqueta que tiene al lado.
                    -->
                    <div class="campoSuelto">
                        <label>Modelo:</label>
                        <input type="text">
                    </div>
                </div>
                <div class="campo">
                    <!--
                    | Un desplegable cuya lista no trae ninguna opción: sólo un
                    | botón que da de alta otro registro, como "Transportista"
                    | en AUTOSTOCKNUVEX. La prueba de alta lo pulsaba como si
                    | fuera una opción; aquí eso saca del alta.
                    -->
                    <div class="desplegablePropio" id="transportista" tabindex="0">
                        <label>Transportista:</label>
                        <span class="desplegableValor" data-valor="">Elige uno</span>
                    </div>
                </div>
                <div class="campo">
                    <label for="matriculacion">Fecha de matriculación</label>
                    <input id="matriculacion" name="matriculacion" type="date">
                </div>
            </div>
            <div class="acciones">
                <button type="button" id="btnCancelarVehiculo" class="secundario">Cancelar</button>
                <button type="button" id="btnSiguienteVehiculo" class="primario" disabled>Siguiente</button>
                <!--
                | "Finalizar" y no "Guardar", y sin type="submit": como el
                | último paso del alta de AUTOSTOCKNUVEX. Ni la palabra ni el
                | atributo dicen que guarda; sólo que aparece donde estaba
                | "Siguiente".
                -->
                <button type="button" id="btnGuardarVehiculo" class="primario" hidden>Finalizar</button>
            </div>
        </form>
    </lab-vehiculo-nuevo>
</div>
`;

        /*
        | Y va por pasos, con "Siguiente" apagado hasta que lo obligatorio del
        | primero está puesto. Es la segunda cosa que hace el alta de
        | AUTOSTOCKNUVEX —en Piezas, Artículos, Servicios y Proveedores— y la
        | que dejaba al Discovery esperando a un botón que no se iba a
        | encender: el del laboratorio está siempre activo y valida al
        | pulsarlo, así que aquí no se veía. Va en esta pantalla y no en el
        | asistente que comparten las demás para no mover sus pruebas.
        */

        const siguiente =
            document.getElementById("btnSiguienteVehiculo");

        const guardar =
            document.getElementById("btnGuardarVehiculo");

        guardar?.addEventListener("click", () =>
            document.getElementById("formVehiculo")?.requestSubmit()
        );

        /*
        | Y "Propósito", que no es un campo
        |
        | Es el único obligatorio del alta de un vehículo de AUTOSTOCKNUVEX, y
        | es un `asn-select`: un `div` que se enfoca, con su etiqueta dentro y
        | sin `input`, ni `select`, ni `role`. Sus opciones se pintan fuera
        | del panel, en la capa donde la aplicación pinta sus listas, con
        | `role="option"`. Rubén lo señaló el 6 de octubre de 2026: el
        | Discovery no lo veía, no lo rellenaba, y "Siguiente" no se encendía
        | nunca.
        |
        | Se copia tal cual, también lo que le falta: sin `role="combobox"` ni
        | `aria-required`. El asterisco va en la etiqueta, como allí.
        */

        const desplegable =
            capa.querySelector(".desplegablePropio:not(#transportista)");

        let listaDeTransportistas = null;

        capa.querySelector("#transportista")?.addEventListener("click", () => {

            if (listaDeTransportistas) {

                listaDeTransportistas.remove();

                listaDeTransportistas = null;

                return;

            }

            const caja =
                capa.querySelector("#transportista").getBoundingClientRect();

            listaDeTransportistas =
                document.createElement("div");

            listaDeTransportistas.className = "desplegableLista";

            listaDeTransportistas.style.cssText =
                `position:fixed;left:${caja.left}px;top:${caja.bottom + 4}px;` +
                `width:${caja.width}px;z-index:1100`;

            listaDeTransportistas.innerHTML =
                `<button type="button" class="secundario">+ Añadir</button>`;

            listaDeTransportistas.querySelector("button").addEventListener("click", () => {

                listaDeTransportistas.remove();

                listaDeTransportistas = null;

                cerrarElPanel();

                if (window.Toast) {

                    Toast.mostrar("Los transportistas se dan de alta en su maestro.", "info");

                }

            });

            document.body.appendChild(listaDeTransportistas);

        });

        const valorElegido =
            desplegable.querySelector(".desplegableValor");

        let lista = null;

        const cerrarLaLista = () => {

            lista?.remove();

            lista = null;

        };

        desplegable.addEventListener("click", () => {

            if (lista) {

                cerrarLaLista();

                return;

            }

            const caja =
                desplegable.getBoundingClientRect();

            lista =
                document.createElement("ul");

            lista.className = "desplegableLista";

            lista.style.cssText =
                `position:fixed;left:${caja.left}px;top:${caja.bottom + 4}px;` +
                `width:${caja.width}px;z-index:1100`;

            lista.innerHTML =
                ["achatarramiento", "despiece", "reparar", "venta"]
                    .map(uno => `<li role="option" tabindex="-1">${uno}</li>`)
                    .join("");

            lista.addEventListener("click", evento => {

                const elegido =
                    evento.target.closest("[role='option']");

                if (!elegido) {

                    return;

                }

                valorElegido.textContent = elegido.textContent;

                valorElegido.dataset.valor = elegido.textContent;

                cerrarLaLista();

                siguiente.disabled = !completo();

            });

            document.body.appendChild(lista);

        });

        const bastidorValido = () => {

            const escrito =
                String(document.getElementById("bastidor")?.value || "").trim();

            return !escrito || /^[A-HJ-NPR-Z0-9]{17}$/.test(escrito);

        };

        /*
        | Y el código de flota, obligatorio y con su forma: "FL-" y cuatro
        | cifras. Con otra cosa, "Siguiente" no se enciende.
        */

        const flotaValida = () =>
            /^FL-[0-9]{4}$/.test(String(document.getElementById("flota")?.value || "").trim());

        const completo = () =>
            ["matricula", "marca"].every(id =>
                String(document.getElementById(id)?.value || "").trim()
            ) &&
            flotaValida() &&
            Boolean(valorElegido.dataset.valor) &&
            bastidorValido();

        document.getElementById("bastidor")?.addEventListener("input", () => {
            document.getElementById("bastidorError").hidden = bastidorValido();
            siguiente.disabled = !completo();
        });

        ["matricula", "marca", "flota"].forEach(id =>
            document.getElementById(id)?.addEventListener("input", () => {
                siguiente.disabled = !completo();
            })
        );

        siguiente?.addEventListener("click", () => {

            if (!completo()) {

                return;

            }

            document.querySelector(".vehiculoPaso[data-paso='1']").hidden = true;

            document.querySelector(".vehiculoPaso[data-paso='2']").hidden = false;

            siguiente.hidden = true;

            guardar.hidden = false;

            capa.querySelector(".campoSuelto input")?.focus();

        });

        document.addEventListener("keydown", conEscape);

        document
            .getElementById("btnCerrarPanel")
            ?.addEventListener("click", cerrarElPanel);

        document
            .getElementById("btnCancelarVehiculo")
            ?.addEventListener("click", cerrarElPanel);

        const formulario =
            document.getElementById("formVehiculo");

        formulario?.addEventListener("submit", evento => {

            evento.preventDefault();

            const datos =
                Object.fromEntries(new FormData(formulario).entries());

            /*
            * El modelo no tiene name, así que FormData no lo trae: se lee por
            * su sitio, como lo haría la aplicación de verdad con su componente.
            */

            datos.modelo =
                capa.querySelector(".campoSuelto input")?.value || "";

            if (!String(datos.matricula || "").trim() ||
                !String(datos.marca || "").trim()) {

                if (window.Toast) {

                    Toast.mostrar("La matrícula y la marca son obligatorias.", "error");

                }

                return;

            }

            Vehiculos.create(datos);

            cerrarElPanel();

            pintar();

            if (window.Toast) {

                Toast.mostrar("Vehículo dado de alta.", "ok");

            }

        });

        document.getElementById("matricula")?.focus();

    }

    /*
    | Y el botón no abre el alta: despliega tres maneras de darla
    |
    | Como el "Nuevo vehículo" de AUTOSTOCKNUVEX, el 6 de octubre de 2026:
    | "Desde VIN", "Desde expediente" y "Manual". Rubén contó lo que hace cada
    | una, y es lo que se copia:
    |
    |   - Manual es el alta directa: el panel de dos pasos de arriba.
    |   - Desde VIN tiene reglas de validación: el bastidor son 17 caracteres,
    |     sin I, O ni Q. Con otra cosa se niega.
    |   - Desde expediente consulta un servicio de fuera, del que no hay
    |     ningún identificador válido. Aquí no hay servicio, así que contesta
    |     siempre que no lo encuentra, y "Guardar" no se enciende nunca.
    |
    | El menú no se anuncia: ni `role="menu"` ni `aria-haspopup`, como el de
    | verdad. Se reconoce por lo que aparece al pulsar.
    */

    const menu =
        document.createElement("div");

    menu.className = "menuAlta";

    menu.hidden = true;

    menu.innerHTML = `
<button type="button" data-alta="vin">Desde VIN</button>
<button type="button" data-alta="expediente">Desde expediente</button>
<button type="button" data-alta="manual">Manual</button>
`;

    boton?.insertAdjacentElement("afterend", menu);

    function cerrarElMenu() {

        menu.hidden = true;

    }

    boton?.addEventListener("click", evento => {

        evento.stopPropagation();

        menu.hidden = !menu.hidden;

    });

    document.addEventListener("click", evento => {

        if (!menu.contains(evento.target)) {

            cerrarElMenu();

        }

    });

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            cerrarElMenu();

        }

    });

    menu.addEventListener("click", evento => {

        const cual =
            evento.target.closest("[data-alta]")?.dataset.alta;

        if (!cual) {

            return;

        }

        cerrarElMenu();

        if (cual === "manual") {

            abrirElAlta();

        }

        if (cual === "vin") {

            abrirElAltaPorVin();

        }

        if (cual === "expediente") {

            abrirElAltaPorExpediente();

        }

    });

    function abrirUnPanel(etiqueta, titulo, cuerpo) {

        capa.innerHTML = `
<div class="capaFondo"></div>
<div class="capaPanel">
    <${etiqueta} class="panelCompleto">
        <header class="panelCabecera">
            <h2>${titulo}</h2>
            <button type="button" class="panelCruz" id="btnCerrarPanel" aria-label="Cerrar">×</button>
        </header>
        ${cuerpo}
    </${etiqueta}>
</div>
`;

        document.addEventListener("keydown", conEscape);

        document
            .getElementById("btnCerrarPanel")
            ?.addEventListener("click", cerrarElPanel);

        capa
            .querySelector("[data-cancelar]")
            ?.addEventListener("click", cerrarElPanel);

    }

    function abrirElAltaPorVin() {

        abrirUnPanel("lab-vehiculo-vin", "Nuevo vehículo desde VIN", `
<form id="formVin" class="formulario">
    <div class="campo">
        <label for="vin">VIN *</label>
        <input id="vin" name="vin" type="text" required maxlength="17">
    </div>
    <p id="vinError" class="aviso" role="alert"></p>
    <div class="acciones">
        <button type="button" data-cancelar class="secundario">Cancelar</button>
        <button type="submit" class="primario">Guardar</button>
    </div>
</form>
`);

        document.getElementById("formVin")?.addEventListener("submit", evento => {

            evento.preventDefault();

            const vin =
                String(document.getElementById("vin")?.value || "").trim().toUpperCase();

            if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {

                document.getElementById("vinError").textContent =
                    "El VIN son 17 caracteres, sin I, O ni Q.";

                return;

            }

            Vehiculos.create({ matricula: "SIN MATRÍCULA", marca: "Desde VIN", modelo: vin });

            cerrarElPanel();

            pintar();

        });

        document.getElementById("vin")?.focus();

    }

    function abrirElAltaPorExpediente() {

        abrirUnPanel("lab-vehiculo-expediente", "Nuevo vehículo desde expediente", `
<form id="formExpediente" class="formulario">
    <div class="campo">
        <label for="expediente">Número de expediente *</label>
        <input id="expediente" name="expediente" type="text" required>
    </div>
    <button type="button" id="btnBuscarExpediente" class="secundario">Buscar</button>
    <p id="expedienteRespuesta" class="aviso" role="status"></p>
    <div class="acciones">
        <button type="button" data-cancelar class="secundario">Cancelar</button>
        <button type="submit" class="primario" disabled>Guardar</button>
    </div>
</form>
`);

        document.getElementById("btnBuscarExpediente")?.addEventListener("click", () => {

            document.getElementById("expedienteRespuesta").textContent =
                "El servicio de expedientes no encuentra ese número.";

        });

        document.getElementById("formExpediente")?.addEventListener("submit", evento => {

            evento.preventDefault();

        });

        document.getElementById("expediente")?.focus();

    }

    buscador?.addEventListener("input", pintar);

    pintar();

});
