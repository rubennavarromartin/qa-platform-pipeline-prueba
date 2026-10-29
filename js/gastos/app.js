/*
|--------------------------------------------------------------------------
| Gastos
|--------------------------------------------------------------------------
|
| La pantalla que plantea una sola pregunta: **¿se reconoce un alta
| cuyo botón no se llama "Nuevo"?**
|
| No usa CrudPage —que es lo que monta las seis listas de siempre—
| a propósito. CrudPage escribe el botón de alta él, con su texto,
| y lo que hay que plantear aquí es justamente otro texto. Montarla
| a mano es diez líneas más y deja el caso donde se ve.
|
| Lo que sí comparte: el buscador, la paginación y el modal, que
| son los mismos de las demás.
|
| El formulario es el mínimo que sigue siendo un formulario de
| verdad: dos campos obligatorios y uno con valor de partida. Con
| un solo campo, la prueba de "campo obligatorio por separado"
| diría lo mismo que la de validación, y eso ya está escrito en el
| planificador.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const cuerpo =
        document.querySelector("#gastosGrid tbody");

    const vacio =
        document.getElementById("gastosVacio");

    const buscador =
        document.getElementById("search");

    const boton =
        document.getElementById("btnNuevo");

    const soloPendientes =
        document.getElementById("soloPendientes");

    if (!cuerpo) {

        return;

    }

    Gastos.load();

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

    /*
    * El panel de filtros. Lo elegido vive aquí y no en el panel, que se pinta
    * de nuevo cada vez que se abre: así es como lo conserva al reabrirlo.
    */

    const filtros = { estado: "" };

    /*
    * Y "Aplicar filtros" se queda apagado un rato después de aplicar, como el
    * de SABESP mientras carga: allí son 34.000 facturas y el servidor tarda.
    * El Discovery le daba dos segundos al clic y el Build del 19 de octubre de
    * 2026 no sacó ningún filtro del panel de Faturas por eso.
    */

    let cargandoHasta = 0;

    const panel =
        document.getElementById("panelFiltros");

    /*
    * Colgado del `body`, fuera de `main`, que es donde lo pinta PrimeNG
    * (`appendTo="body"`). Dentro de `main` la foto de la pantalla lo veía
    * aparecer y el botón salía como uno que la cambia; fuera, como en SABESP,
    * abrirlo no cambia nada de lo que la foto mira, y el Build del 20 de
    * octubre de 2026 apuntó "Filtros avancados" como un botón que no hace nada.
    */

    if (panel && panel.parentElement !== document.body) {

        document.body.appendChild(panel);

    }

    function cerrarElPanel() {

        if (panel) {

            panel.hidden = true;

            panel.innerHTML = "";

        }

    }

    function abrirElPanel() {

        if (!panel) {

            return;

        }

        panel.innerHTML = `

<h2>Más filtros</h2>

<div class="campo">
    <label for="filtroEstadoGasto">Estado</label>
    <select id="filtroEstadoGasto">
        <option value="">Todos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Aprobado">Aprobado</option>
        <option value="Rechazado">Rechazado</option>
    </select>
</div>

<div class="panel-filtros-pie">
    <button type="button" class="secundario" id="limpiarFiltrosGasto">Limpiar</button>
    <button type="button" class="primario" id="aplicarFiltrosGasto">Aplicar filtros</button>
</div>

`;

        const elegido =
            document.getElementById("filtroEstadoGasto");

        elegido.value = filtros.estado;

        /*
        * Elegir no filtra: hasta "Aplicar filtros" no cambia nada. Lo que se
        * elige se guarda para que, si el panel se cierra sin aplicar, al
        * reabrirlo siga elegido, como en SABESP.
        */

        let pendiente = filtros.estado;

        elegido.addEventListener("change", () => { pendiente = elegido.value; });

        document.getElementById("limpiarFiltrosGasto").addEventListener("click", () => {

            elegido.value = "";

            pendiente = "";

        });

        const aplicar =
            document.getElementById("aplicarFiltrosGasto");

        aplicar.addEventListener("click", () => {

            filtros.estado = pendiente;

            cargandoHasta = Date.now() + 4000;

            cerrarElPanel();

            pintar();

        });

        const falta =
            cargandoHasta - Date.now();

        if (falta > 0) {

            aplicar.disabled = true;

            setTimeout(() => { aplicar.disabled = false; }, falta);

        }

        panel.hidden = false;

        elegido.focus();

    }

    document.getElementById("btnMasFiltros")
        ?.addEventListener("click", () => {

            if (panel?.hidden === false) {

                cerrarElPanel();

            }
            else {

                abrirElPanel();

            }

        });

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape" && panel && !panel.hidden) {

            cerrarElPanel();

        }

    });

    function sinIva() {

        return document
            .querySelector(".alternativas-grupo [data-iva='sin']")
            ?.getAttribute("aria-pressed") === "true";

    }

    function enEuros(importe) {

        return Number(importe).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " €";

    }

    function fila(uno) {

        return `

<tr data-id="${uno.id}">

    <td>${escapar(uno.concepto)}</td>
    <td>${escapar(uno.fecha)}</td>
    <td>${escapar(enEuros(sinIva() ? uno.importe / 1.21 : uno.importe))}</td>
    <td>${Badge.status(uno.estado)}</td>

</tr>

`;

    }

    function pintar() {

        /*
        * El interruptor sólo cambia lo que se enseña: no se guarda en ningún
        * sitio, ni al cambiarlo ni al recargar.
        */

        const todos =
            Gastos.search(buscador?.value)
                .filter(uno => !soloPendientes?.checked || uno.estado === "Pendiente")
                .filter(uno => !filtros.estado || uno.estado === filtros.estado);

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
                    : "No hay gastos que coincidan con la búsqueda.";

        }

    }

    /*
    | El alta
    |
    | El botón se llama "Subir gasto" y abre este formulario. Eso es
    | todo el caso: un botón de la pantalla, con un texto que no
    | empieza por ninguna de las seis palabras, que abre un diálogo
    | con campos.
    */

    /*
    | Una lista que no es un campo, con la forma del `p-select` de PrimeNG
    |
    | Un `span` con `role="combobox"` y `aria-haspopup="listbox"`, la
    | etiqueta fuera apuntándole con `for`, y la lista colgada del `body`
    | —el `appendTo="body"` de PrimeNG—, no dentro del diálogo. El valor va a
    | un campo escondido, que es lo que se guarda.
    |
    | Es la pregunta que dejó SABESP el 21 de octubre de 2026: sus altas tienen
    | listas así, obligatorias —"Agente contraparte *", "Unidade consumidora
    | *", "Distribuidora *"—, y la plataforma no las veía como campos. No las
    | rellenaba, el botón de guardar no se encendía, y unas cuarenta pruebas de
    | escribir salían en rojo en seis formularios. Sin elegir categoría este
    | alta no guarda.
    */

    function listaPropia(control, valor, opciones) {

        if (!control || !valor) {

            return;

        }

        let lista = null;

        const cerrar = () => {

            lista?.remove();

            lista = null;

            control.setAttribute("aria-expanded", "false");

            control.removeAttribute("aria-controls");

        };

        const abrir = () => {

            const caja =
                control.getBoundingClientRect();

            lista =
                document.createElement("ul");

            lista.id =
                control.id + "Lista";

            lista.setAttribute("role", "listbox");

            lista.className =
                "lista-propia-opciones";

            lista.style.cssText =
                `position:fixed;left:${caja.left}px;top:${caja.bottom + 2}px;` +
                `min-width:${caja.width}px;z-index:2000;`;

            lista.innerHTML =
                opciones
                    .map(opcion => `<li role="option" tabindex="-1">${opcion}</li>`)
                    .join("");

            lista.addEventListener("click", evento => {

                const opcion =
                    evento.target.closest("[role='option']");

                if (!opcion) {

                    return;

                }

                control.textContent =
                    opcion.textContent;

                valor.value =
                    opcion.textContent;

                cerrar();

            });

            document.body.appendChild(lista);

            control.setAttribute("aria-expanded", "true");

            control.setAttribute("aria-controls", lista.id);

        };

        control.addEventListener("click", () => (lista ? cerrar() : abrir()));

        control.addEventListener("keydown", evento => {

            if (evento.key === "Escape") {

                cerrar();

            }

            if (evento.key === "Enter" || evento.key === " " || evento.key === "ArrowDown") {

                evento.preventDefault();

                if (!lista) {

                    abrir();

                }

            }

        });

        /*
        * Y se cierra con el diálogo: colgada del `body`, sobreviviría a él.
        */

        new MutationObserver((cambios, observador) => {

            if (!document.body.contains(control)) {

                cerrar();

                observador.disconnect();

            }

        }).observe(document.body, { childList: true, subtree: true });

    }

    function abrirElAlta() {

        Modal.open(`

<h2>Subir un gasto</h2>

<form id="formGasto" class="formulario">

    <div class="campo">
        <label for="concepto">Concepto *</label>
        <input id="concepto" name="concepto" type="text">
    </div>

    <div class="campo">
        <label for="importe">Importe *</label>
        <input id="importe" name="importe" type="number" step="0.01" min="0">
    </div>

    <div class="campo">
        <label for="fecha">Fecha</label>
        <input id="fecha" name="fecha" type="date"
               value="${new Date().toISOString().slice(0, 10)}">
    </div>

    <div class="campo">
        <label for="categoriaGasto">Categoría *</label>
        <span id="categoriaGasto" role="combobox" tabindex="0"
              aria-haspopup="listbox" aria-expanded="false"
              aria-label="Elige una categoría"
              class="lista-propia">Elige una categoría</span>
        <input type="hidden" name="categoria" id="categoriaGastoValor">
    </div>

    <div class="acciones">
        <button type="button" id="btnCancelar" class="secundario">Cancelar</button>
        <button type="submit" class="primario">Guardar</button>
    </div>

</form>

`);

        listaPropia(
            document.getElementById("categoriaGasto"),
            document.getElementById("categoriaGastoValor"),
            ["Viajes", "Comidas", "Material de oficina", "Formación"]
        );

        /*
        | Y los dos campos obligatorios se marcan **un poco después**
        |
        | No es un capricho: es lo que hace Angular Material, y es lo que
        | destapó un fallo que llevaba aquí desde el 10 de septiembre de 2026.
        | El alta de Tarjetas empresa de Bitácora tiene seis campos y los seis
        | obligatorios, y la plataforma leía **dos y ninguno obligatorio**,
        | porque contaba el diálogo nada más verlo y `count()` no espera.
        |
        | Con esto, el laboratorio plantea esa pregunta: un diálogo que se
        | monta por partes. Si quien lo lee no espera a que la cuenta se
        | asiente, este alta deja de reconocerse — y se ve contando.
        |
        | 250 ms es de sobra para notarse y poco para molestar a nadie: lo que
        | se plantea es que el montaje no sea instantáneo, no cuánto tarda.
        */

        setTimeout(() => {

            document.getElementById("concepto")?.setAttribute("required", "");

            document.getElementById("importe")?.setAttribute("required", "");

        }, 250);

        const formulario =
            document.getElementById("formGasto");

        document
            .getElementById("btnCancelar")
            ?.addEventListener("click", () => Modal.close());

        formulario?.addEventListener("submit", evento => {

            evento.preventDefault();

            const datos =
                Object.fromEntries(new FormData(formulario).entries());

            /*
            * Y lo obligatorio se exige de verdad.
            *
            * Faltaba, y lo destapó la propia plataforma en la primera pasada
            * en que esta pantalla existía: `Gastos-VALIDACION` y
            * `Gastos-OBLIGATORIO` salieron en rojo diciendo que el formulario
            * se cerraba sin Concepto ni Importe teniéndolos declarados como
            * obligatorios.
            *
            * El `required` estaba puesto —se marca aquí al lado, 250 ms
            * después de abrir el diálogo— y no servía de nada: `submit`
            * llamaba a `preventDefault` antes de que el navegador validara, y
            * con eso el `required` no llega a actuar nunca.
            *
            * Eso es lo que hay que mirar cuando una validación "está": que
            * esté escrita no es que se cumpla. Un atributo que se ve en el
            * código y no se exige en la pantalla es peor que no tenerlo,
            * porque quien lea el código dará por hecho que sí — y es
            * exactamente el caso que estas dos clases existen para cazar.
            */

            if (!String(datos.concepto || "").trim()) {

                if (window.Toast) {

                    Toast.mostrar("El concepto es obligatorio.", "error");

                }

                return;

            }

            if (!String(datos.importe || "").trim()) {

                if (window.Toast) {

                    Toast.mostrar("El importe es obligatorio.", "error");

                }

                return;

            }

            if (!String(datos.categoria || "").trim()) {

                if (window.Toast) {

                    Toast.mostrar("La categoría es obligatoria.", "error");

                }

                return;

            }

            Gastos.create(datos);

            Modal.close();

            pintar();

            if (window.Toast) {

                Toast.mostrar("Gasto subido.", "ok");

            }

        });

        document.getElementById("concepto")?.focus();

    }

    /*
    | Y el exportador, que es la otra mitad del caso
    |
    | Sus dos campos son `type="text"` y no `type="date"`, aunque pidan fechas,
    | y eso es a propósito: **así es como están en Bitácora**, con un calendario
    | de Angular Material encima de un campo de texto.
    |
    | Importa porque la primera acotación de la regla miraba el tipo del campo
    | y funcionaba aquí —donde yo había escrito `type="date"`— y no allí. Un
    | caso montado a mano que no se parece al real avala una regla que no
    | sirve, y eso es peor que no tener el caso.
    |
    | Abre un diálogo con campos, igual que el alta, y no es un alta: dos
    | fechas y un fichero que se descarga. Si la plataforma lo tomara por un
    | alta, escribiría una prueba de CREATE sobre un exportador — y ésa falla
    | siempre, con un rojo que no es de la aplicación.
    |
    | La descarga es de mentira a propósito: un `Blob` y un enlace. Lo que se
    | plantea es qué abre el botón, no qué formato tiene el fichero, y bajarse
    | un CSV de verdad en cada exploración no añadiría ninguna pregunta.
    */

    function abrirElExportador() {

        Modal.open(`

<h2>Exportar gastos</h2>

<form id="formExportar" class="formulario">

    <div class="campo">
        <label for="desde">Desde</label>
        <input id="desde" name="desde" type="text" placeholder="dd/mm/aaaa">
    </div>

    <div class="campo">
        <label for="hasta">Hasta</label>
        <input id="hasta" name="hasta" type="text" placeholder="dd/mm/aaaa">
    </div>

    <div class="acciones">
        <button type="button" id="btnCerrarExportar" class="secundario">Cancelar</button>
        <button type="submit" class="primario">Descargar</button>
    </div>

</form>

`);

        document
            .getElementById("btnCerrarExportar")
            ?.addEventListener("click", () => Modal.close());

        document
            .getElementById("formExportar")
            ?.addEventListener("submit", evento => {

                evento.preventDefault();

                const fichero =
                    new Blob(
                        [Gastos.findAll()
                            .map(uno => `${uno.fecha};${uno.concepto};${uno.importe}`)
                            .join("\n")],
                        { type: "text/csv" }
                    );

                const enlace =
                    document.createElement("a");

                enlace.href = URL.createObjectURL(fichero);

                enlace.download = "gastos.csv";

                enlace.click();

                URL.revokeObjectURL(enlace.href);

                Modal.close();

                if (window.Toast) {

                    Toast.mostrar("Gastos exportados.", "ok");

                }

            });

    }

    /*
    * Y se abre un momento después del clic, no en el acto: como "Nova
    * unidade" de SABESP, que pide sus catálogos antes de pintar el
    * formulario. Medido el 16 de octubre de 2026: a los 0 ms del clic no hay
    * ningún diálogo en el documento, y a los 100 ms está. Un Discovery que
    * pregunte sólo en el instante del clic cree que el botón no ha abierto
    * nada y que ha cambiado la pantalla, y el alta no se explora.
    */

    boton?.addEventListener("click", () => setTimeout(abrirElAlta, 150));

    document
        .getElementById("btnExportar")
        ?.addEventListener("click", abrirElExportador);

    buscador?.addEventListener("input", pintar);

    soloPendientes?.addEventListener("change", pintar);

    /*
    * Los botones de alternativa: el que se pulsa queda elegido y los demás
    * no, y la tabla se vuelve a pintar. No se guarda en ningún sitio: es cómo
    * se mira, no un dato.
    */

    const alternativas =
        [...document.querySelectorAll(".alternativas-grupo [role='button']")];

    alternativas.forEach(opcion => {

        const elegir = () => {

            alternativas.forEach(otra =>
                otra.setAttribute("aria-pressed", String(otra === opcion))
            );

            pintar();

        };

        opcion.addEventListener("click", elegir);

        opcion.addEventListener("keydown", evento => {

            if (evento.key === "Enter" || evento.key === " ") {

                evento.preventDefault();

                elegir();

            }

        });

    });

    pintar();

});
