/*
|--------------------------------------------------------------------------
| Cuadro de mando
|--------------------------------------------------------------------------
|
| Seis cifras de lo que hay en el CRM, en cajas, y la evolución por meses de
| la que se elija.
|
| Esta pantalla se hizo para plantearle una pregunta a la plataforma: qué
| dice de una pantalla que **ninguna regla sabe leer**. No hay tabla con
| cabeceras, ni formulario con etiquetas, ni buscador. Sólo números dentro de
| cajas, dos botones y un dibujo.
|
| Las cifras se calculan aquí y no se guardan en ningún sitio: un panel que
| guardara sus propios totales podría enseñar uno distinto del que sale de
| los listados, y entonces no se sabría cuál de los dos está mal. Es la
| misma razón por la que los totales de un presupuesto se calculan en su
| repositorio.
|
| Y salen de los repositorios de verdad, así que se pueden comprobar contra
| las otras pantallas: si aquí dice 14 empresas y en Empresas hay 15, una de
| las dos miente.
|
|--------------------------------------------------------------------------
| Cada caja es una pestaña, y no un botón
|--------------------------------------------------------------------------
|
| Pulsar una caja no *hace* nada: **elige** qué serie se dibuja. Eso es una
| pestaña, y por eso se usa el patrón de ARIA con el mismo componente que las
| pestañas de una ficha, en lugar de seis botones con una clase de CSS que
| diga cuál está activo.
|
| La diferencia no es cosmética. Una pestaña dice cuál está puesta
| —`aria-selected`— y a qué región manda —`aria-controls`—, así que el
| vínculo entre lo que se pulsa y lo que cambia está escrito. Con botones
| habría que deducirlo del aspecto, que es adivinar.
|
| El nombre accesible de la caja se escribe a mano: es el de su indicador y
| nada más. Si se dejara heredar, sería "15 Empresas en el catálogo" —la
| cifra dentro del nombre— y cambiaría cada vez que cambien los datos, que es
| la misma trampa del identificador con número de serie. La cifra sigue
| viéndose, marcada como decorativa.
|
| Y ahí queda, sin resolver a propósito, la pregunta para la plataforma: el
| texto de esa caja **no coincide** con su nombre accesible. Cuando los dos
| no dicen lo mismo, hay que creerle al nombre, porque es el que alguien
| escribió a propósito.
|
|--------------------------------------------------------------------------
| La gráfica se puede probar sin mirarla
|--------------------------------------------------------------------------
|
| Un dibujo no se comprueba mirándolo, así que la gráfica lleva el dato
| encima de cuatro maneras, y ninguna es un favor a la plataforma: es lo que
| hace una aplicación que se puede usar con un lector de pantalla.
|
|   La tabla equivalente, dentro de la propia figura. Es lo que recomienda
|   WCAG para una imagen compleja, y de paso es lo único de esta pantalla que
|   la plataforma ya sabe leer hoy.
|
|   Cada punto con su mes y su valor, y con su nombre —"Marzo: 3"—, para
|   poder comprobar que **el dibujo y la tabla dicen lo mismo**. El fallo
|   típico de una gráfica es que el dato esté bien y la línea esté mal, y sin
|   esto no se distingue.
|
|   El título dice qué serie se está viendo, y se anuncia al cambiar. Es el
|   único sitio donde queda escrito "he pulsado Empresas, estoy viendo
|   Empresas".
|
|   Y un resumen en una frase, que es lo que oye quien no ve el dibujo.
|
| En SVG y no en canvas: un canvas no deja nada en el documento, y entonces
| la respuesta honesta de cualquiera que venga a probarlo sería "esto no se
| puede comprobar sin mirar píxeles".
|
| Las series salen de los repositorios, como las cifras. Y cada una dice de
| dónde sale, porque no todas cuadran con su caja: las de presupuestos y
| citas son los propios registros por su fecha, y las de empresas y contactos
| son las altas que consten en Actividad, que no son todas las que hay —las
| sembradas no pasaron por ningún formulario—. Decir eso es más honesto que
| enseñar una línea que no suma lo que dice la caja de arriba.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const caja =
        document.getElementById("indicadores");

    const cajaDeGraficas =
        document.getElementById("graficas");

    if (!caja) {

        return;

    }

    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    /*
    * Cuál está elegida. Se guarda para que actualizar las cifras no devuelva
    * la pantalla a la primera caja: quien está mirando una serie quiere
    * seguir mirándola.
    */

    let elegida =
        "empresas";

    const euros =
        cuanto => `${
            Number(cuanto || 0).toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        } €`;

    const numero =
        cuanto => String(Number(cuanto || 0));

    /*
    * De qué ejercicio se habla.
    *
    * De partida, el que esté puesto en Configuración → Presupuestos, que es
    * el mismo con el que se numeran los códigos: así el panel y los códigos
    * cuentan lo mismo al abrir.
    *
    * Y desde ahí, el que diga el desplegable de la pantalla. Es un filtro de
    * esta pantalla y **no toca Configuración**: mirar el panel de otro año no
    * puede tener el efecto de que el siguiente presupuesto se numere
    * distinto.
    */

    function elDeConfiguracion() {

        return typeof Codigos !== "undefined"
            ? Codigos.ajustes().ejercicio
            : new Date().getFullYear();

    }

    let elegido =
        null;

    function ejercicio() {

        return elegido || elDeConfiguracion();

    }

    /*
    * Los años que se pueden elegir son los mismos que ofrece Configuración:
    * se le preguntan a quien los sabe en lugar de escribir otra lista que
    * habría que mantener de acuerdo con aquélla.
    */

    function ejercicios() {

        if (typeof Codigos === "undefined") {

            return [ejercicio()];

        }

        const suyos =
            Codigos.ejercicios();

        return suyos.includes(ejercicio())
            ? suyos
            : [ejercicio(), ...suyos];

    }

    function presupuestos() {

        return typeof Quotes !== "undefined"
            ? Quotes.findAll()
            : [];

    }

    function citas() {

        return typeof Appointments !== "undefined"
            ? Appointments.findAll()
            : [];

    }

    function deEsteEjercicio(lista, campo = "createdAt") {

        const ano =
            String(ejercicio());

        return lista.filter(
            uno => String(uno[campo] || "").startsWith(ano)
        );

    }

    /*
    * De qué mes es una fecha con la forma 2026-03-18, y de qué mes es una
    * marca de tiempo con hora. Se mira el texto y no se construye una fecha:
    * `new Date("2026-03-18")` es medianoche en Londres, y en verano eso es
    * el 17 por la noche aquí. Ese día de diferencia movería un registro de
    * mes en las fechas de principio de mes.
    */

    function mesDe(cual) {

        const texto =
            String(cual || "");

        const ano =
            String(ejercicio());

        if (!texto.startsWith(ano)) {

            return -1;

        }

        const mes =
            Number(texto.slice(5, 7));

        return mes >= 1 && mes <= 12 ? mes - 1 : -1;

    }

    /*
    * Cuántos hay de cada mes, y cuánto suman. Doce huecos siempre, aunque
    * estén a cero: una serie a la que le faltan los meses vacíos se dibuja
    * más corta y engaña.
    */

    function porMeses(lista, campo, cuanto = null) {

        const serie =
            new Array(12).fill(0);

        for (const uno of lista) {

            const mes =
                mesDe(uno[campo]);

            if (mes < 0) {

                continue;

            }

            serie[mes] += cuanto ? cuanto(uno) : 1;

        }

        return serie;

    }

    /*
    * El registro de actividad se llama `Log`, no `Activity`: lo que se
    * pregunta es cómo se llama de verdad y no cómo parecía razonable que se
    * llamara. Con el nombre equivocado no fallaba nada —la serie salía
    * vacía— y el panel decía "no hay datos" mientras la pantalla de
    * Actividad enseñaba el alta.
    */

    function altasEnActividad(entidad) {

        if (typeof Log === "undefined") {

            return [];

        }

        return Log.filtrar({ entidad, accion: "Alta" });

    }

    /*
    * El total de un presupuesto se le pide a quien sabe calcularlo. Aquí
    * sólo se suma: repetir la cuenta del IVA y de los descuentos en esta
    * pantalla sería tener dos cuentas que se pueden separar.
    */

    function total(quote) {

        if (typeof Quotes !== "undefined" && Quotes.totales) {

            return Quotes.totales(quote).total || 0;

        }

        return (quote.lines || []).reduce(
            (suma, linea) =>
                suma + (Number(linea.units) || 0) * (Number(linea.price) || 0),
            0
        );

    }

    function citasDeEstaSemana() {

        const hoy =
            new Date();

        /*
        * La semana empieza el lunes, que es como se cuenta aquí. Con
        * getDay() el domingo es 0, así que se le trata como el séptimo
        * día y no como el primero.
        */

        const diaDeLaSemana =
            hoy.getDay() === 0 ? 7 : hoy.getDay();

        const lunes =
            new Date(hoy);

        lunes.setDate(hoy.getDate() - (diaDeLaSemana - 1));

        const domingo =
            new Date(lunes);

        domingo.setDate(lunes.getDate() + 6);

        const enFecha =
            cual => {

                const partes =
                    String(cual || "").split("-").map(Number);

                if (partes.length !== 3) {

                    return null;

                }

                return new Date(partes[0], partes[1] - 1, partes[2]);

            };

        return citas().filter(una => {

            const cuando =
                enFecha(una.date);

            return cuando &&
                cuando >= new Date(lunes.toDateString()) &&
                cuando <= new Date(domingo.toDateString());

        }).length;

    }

    /*
    * Los seis indicadores. Cada uno lleva su cifra, su serie por meses y de
    * dónde sale esa serie, que es lo que se le dice a quien la mire.
    */

    function cifras() {

        const todos =
            presupuestos();

        const delEjercicio =
            deEsteEjercicio(todos);

        const aceptados =
            delEjercicio.filter(uno => uno.status === "Aceptado");

        const importe =
            aceptados.reduce((suma, uno) => suma + total(uno), 0);

        const empresas =
            typeof Companies !== "undefined"
                ? Companies.findAll().length
                : 0;

        const contactos =
            typeof Contacts !== "undefined"
                ? Contacts.findAll().length
                : 0;

        /*
        * Las altas del ejercicio, del registro de Actividad, y las citas del
        * ejercicio. Se filtran una vez y se usan dos: para la cifra y para la
        * serie, que es lo que garantiza que digan lo mismo.
        */

        const delEjercicioEnElLog =
            lista => lista.filter(una => mesDe(una.fecha) >= 0);

        const deEmpresas =
            delEjercicioEnElLog(altasEnActividad("Empresa"));

        const deContactos =
            delEjercicioEnElLog(altasEnActividad("Contacto"));

        const deLasCitas =
            deEsteEjercicio(citas(), "date");

        return [

            /*
            * Las dos primeras cuentan **altas del ejercicio** y no lo que hay
            * en el catálogo, y el total del catálogo se dice al lado.
            *
            * Era al revés, y con un ejercicio que se puede elegir no se
            * sostenía: la caja decía 14 y su gráfica dibujaba una, porque el
            * catálogo no es de ningún año. Ahora las seis cajas dicen lo
            * mismo que sus series, y la suma de los doce meses es la caja.
            */

            {
                clave: "empresas",
                nombre: "Empresas",
                valor: String(deEmpresas.length),
                dice: `${empresas} en el catálogo`,
                serie: porMeses(deEmpresas, "fecha"),
                serieDice:
                    "Altas de empresa por mes, según el registro de Actividad. " +
                    "La suma de los doce meses es el indicador, y no son todas " +
                    "las del catálogo: las sembradas no pasaron por ningún " +
                    "formulario.",
                formato: numero
            },

            {
                clave: "contactos",
                nombre: "Contactos",
                valor: String(deContactos.length),
                dice: `${contactos} en total`,
                serie: porMeses(deContactos, "fecha"),
                serieDice:
                    "Altas de contacto por mes, según el registro de " +
                    "Actividad. La suma de los doce meses es el indicador.",
                formato: numero
            },

            {
                clave: "presupuestos",
                nombre: `Presupuestos de ${ejercicio()}`,
                valor: String(delEjercicio.length),
                dice: `${todos.length} en total, contando otros ejercicios`,
                serie: porMeses(delEjercicio, "createdAt"),
                serieDice:
                    "Presupuestos por su fecha. La suma de los doce meses es " +
                    "el indicador.",
                formato: numero
            },

            {
                clave: "aceptados",
                nombre: "Aceptados",
                valor: String(aceptados.length),
                dice: delEjercicio.length
                    ? `el ${Math.round(
                        aceptados.length / delEjercicio.length * 100
                    )} % de los de este ejercicio`
                    : "todavía no hay presupuestos de este ejercicio",
                serie: porMeses(aceptados, "createdAt"),
                serieDice:
                    "Presupuestos aceptados por su fecha. La suma de los doce " +
                    "meses es el indicador.",
                formato: numero
            },

            {
                clave: "importe",
                nombre: "Importe aceptado",
                valor: euros(importe),
                dice: "impuestos incluidos",
                serie: porMeses(aceptados, "createdAt", total),
                serieDice:
                    "Importe de los presupuestos aceptados por su fecha, " +
                    "impuestos incluidos. La suma de los doce meses es el " +
                    "indicador.",
                formato: euros
            },

            {
                clave: "citas",
                nombre: "Citas",
                valor: String(deLasCitas.length),
                dice: `${citasDeEstaSemana()} esta semana`,
                serie: porMeses(deLasCitas, "date"),
                serieDice:
                    "Citas por mes del ejercicio. La suma de los doce meses es " +
                    "el indicador; lo de esta semana se dice al lado porque no " +
                    "es de ningún mes en particular.",
                formato: numero
            }

        ];

    }

    /*
    * El dibujo. Sin ninguna dependencia: doce puntos, una línea que los une
    * y los nombres de los meses debajo.
    *
    * El eje de la izquierda enseña el máximo y el cero, que es lo mínimo
    * para poder leer una altura. Más marcas serían adorno.
    */

    function dibujo(una) {

        const serie =
            una.serie;

        const mayor =
            Math.max(...serie, 1);

        const ancho = 720;
        const alto = 220;
        const margen = 48;

        const x =
            cual => margen + cual * (ancho - margen * 2) / (serie.length - 1);

        const y =
            valor => alto - margen - (valor / mayor) * (alto - margen * 2);

        const puntos =
            serie.map((valor, cual) => `${x(cual).toFixed(1)},${y(valor).toFixed(1)}`);

        return `

            <svg class="graficaDibujo"
                 viewBox="0 0 ${ancho} ${alto}"
                 role="img"
                 aria-labelledby="graficaTitulo-${una.clave} graficaResumen-${una.clave}">

                <line class="graficaEje"
                      x1="${margen}" y1="${margen - 8}"
                      x2="${margen}" y2="${alto - margen}" />

                <line class="graficaEje"
                      x1="${margen}" y1="${alto - margen}"
                      x2="${ancho - margen}" y2="${alto - margen}" />

                <text class="graficaMarca" x="${margen - 8}" y="${margen - 2}"
                      text-anchor="end">${una.formato(mayor)}</text>

                <text class="graficaMarca" x="${margen - 8}" y="${alto - margen}"
                      text-anchor="end">0</text>

                <polyline class="graficaLinea"
                          points="${puntos.join(" ")}" />

                ${serie.map((valor, cual) => `

                    <circle class="graficaPunto"
                            cx="${x(cual).toFixed(1)}"
                            cy="${y(valor).toFixed(1)}"
                            r="5"
                            data-mes="${ejercicio()}-${String(cual + 1).padStart(2, "0")}"
                            data-valor="${valor}">
                        <title>${MESES[cual]}: ${una.formato(valor)}</title>
                    </circle>

                `).join("")}

                ${serie.map((valor, cual) => `

                    <text class="graficaMes"
                          x="${x(cual).toFixed(1)}"
                          y="${alto - margen + 20}"
                          text-anchor="middle">${MESES[cual].slice(0, 3)}</text>

                `).join("")}

            </svg>

        `;

    }

    function tabla(una) {

        return `

            <details class="graficaDatos">

                <summary>Ver los datos</summary>

                <table id="graficaTabla-${una.clave}">

                    <caption>${una.nombre}, por meses de ${ejercicio()}</caption>

                    <thead>
                        <tr>
                            <th scope="col">Mes</th>
                            <th scope="col">Valor</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${una.serie.map((valor, cual) => `
                            <tr data-mes="${ejercicio()}-${String(cual + 1).padStart(2, "0")}">
                                <th scope="row">${MESES[cual]}</th>
                                <td data-valor="${valor}">${una.formato(valor)}</td>
                            </tr>
                        `).join("")}
                    </tbody>

                </table>

            </details>

        `;

    }

    function grafica(una) {

        const hayDatos =
            una.serie.some(valor => valor > 0);

        return `

            <div role="tabpanel"
                 id="graficaDe-${una.clave}"
                 aria-labelledby="indicador-${una.clave}"
                 tabindex="0">

                <figure class="grafica">

                    <figcaption id="graficaTitulo-${una.clave}"
                                class="graficaTitulo"
                                aria-live="polite">
                        ${una.nombre}, por meses de ${ejercicio()}
                    </figcaption>

                    ${
                        hayDatos
                            ? dibujo(una)
                            : `<p class="vacio" id="graficaVacia-${una.clave}">
                                   <strong>No hay datos de ${ejercicio()}</strong>
                                   para este indicador.
                               </p>`
                    }

                    <p id="graficaResumen-${una.clave}" class="graficaResumen">
                        ${una.serieDice}
                    </p>

                    ${hayDatos ? tabla(una) : ""}

                </figure>

            </div>

        `;

    }

    /*
    * El desplegable del ejercicio. Se pinta con los años que ofrece
    * Configuración y con el que esté puesto marcado, y se vuelve a pintar en
    * cada repintado: si no, cambiar de año lo dejaría enseñando el anterior.
    */

    function pintarElEjercicio() {

        const campo =
            document.getElementById("panelEjercicio");

        if (!campo) {

            return;

        }

        campo.innerHTML =
            ejercicios().map(ano => `
                <option value="${ano}" ${
                    ano === ejercicio() ? "selected" : ""
                }>${ano}</option>
            `).join("");

    }

    function pintar() {

        pintarElEjercicio();

        const todas =
            cifras();

        if (!todas.some(una => una.clave === elegida)) {

            elegida = todas[0].clave;

        }

        /*
        * Las cajas. Cada una es una pestaña que manda sobre su gráfica, y su
        * nombre accesible es el del indicador: la cifra va marcada como
        * decorativa para que no acabe dentro del nombre.
        */

        caja.innerHTML =
            todas.map(una => `

                <button type="button"
                        class="indicador"
                        role="tab"
                        id="indicador-${una.clave}"
                        aria-controls="graficaDe-${una.clave}"
                        aria-labelledby="indicadorNombre-${una.clave}"
                        aria-selected="${una.clave === elegida ? "true" : "false"}">

                    <span class="indicadorValor" aria-hidden="true">${una.valor}</span>

                    <span class="indicadorNombre"
                          id="indicadorNombre-${una.clave}">${una.nombre}</span>

                    <span class="indicadorDice" aria-hidden="true">${una.dice}</span>

                </button>

            `).join("");

        if (cajaDeGraficas) {

            cajaDeGraficas.innerHTML =
                todas.map(grafica).join("");

        }

        /*
        * Y se monta el conmutador con el mismo componente que las pestañas de
        * una ficha. Se llama después de pintar porque las pestañas no existían
        * al cargar la página, y hay que volver a llamarlo en cada repintado:
        * los botones de antes ya no están.
        */

        if (typeof Tabs !== "undefined") {

            Tabs.create();

        }

    }

    /*
    * Cuál se ha elegido, para que un repintado no la pierda. Se escucha el
    * evento que anuncia el componente en lugar de enganchar cada caja: así
    * también se entera de los cambios con las flechas del teclado.
    */

    document.addEventListener("pestana", evento => {

        const cual =
            String(evento.detail?.tab || "");

        if (cual.startsWith("indicador-")) {

            elegida = cual.slice("indicador-".length);

        }

    });

    function avisar(texto) {

        const aviso =
            document.getElementById("panelAviso");

        aviso.textContent = texto;

        aviso.className = "aviso ok";

        if (typeof Toast !== "undefined") {

            Toast.mostrar(texto, "ok");

        }

    }

    /*
    * Cambiar el ejercicio repinta la pantalla entera: las seis cifras y las
    * seis gráficas dependen de él. Y no se guarda en ninguna parte, que es lo
    * que lo distingue del ejercicio de Configuración.
    */

    document
        .getElementById("panelEjercicio")
        ?.addEventListener("change", evento => {

            elegido =
                Number(evento.target.value) || null;

            pintar();

            avisar(`Panel del ejercicio ${ejercicio()}.`);

        });

    document
        .getElementById("refreshPanelButton")
        .addEventListener("click", () => {

            pintar();

            avisar("Cifras actualizadas.");

        });

    /*
    * Exportar deja las cifras en el portapapeles como texto. No abre un
    * fichero a propósito: una descarga la plataforma ya sabe probarla, y
    * lo que interesa de esta pantalla es que no se parezca a nada de lo
    * que ya sabe leer.
    */

    document
        .getElementById("exportPanelButton")
        .addEventListener("click", async () => {

            const texto =
                [`Cuadro de mando · ejercicio ${ejercicio()}`]
                    .concat(
                        cifras().map(
                            una => `${una.nombre}: ${una.valor} (${una.dice})`
                        )
                    )
                    .join("\n");

            try {

                await navigator.clipboard.writeText(texto);

                avisar("Cifras copiadas al portapapeles.");

            }
            catch {

                /*
                * Sin permiso del portapapeles se enseña el texto, que es
                * mejor que decir que se ha copiado algo que no se ha
                * copiado.
                */

                document.getElementById("panelAviso").textContent = texto;

            }

        });

    pintar();

    if (typeof Permissions !== "undefined") {

        Permissions.aplicar();

    }

});
