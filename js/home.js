/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
|
| Los indicadores de la pantalla de entrada y el resumen de lo
| último que ha pasado.
|
| Los contadores se preguntan a los repositorios y no a lo que
| hay guardado en el navegador. Contando sólo lo guardado, un
| navegador recién abierto —que es como arranca cada prueba de
| Playwright— decía que no había ninguna empresa cuando hay
| catorce: los registros de partida viven en el repositorio y no
| se guardan hasta que alguien entra en su pantalla.
|
*/

(function () {

    /*
    * Los repositorios se preguntan uno a uno con `typeof` y no
    * por `window`: un `const` de primer nivel no se cuelga del
    * objeto global, así que `window.Companies` es siempre
    * indefinido por mucho que el fichero esté cargado.
    */

    function repositorioDe(nombre) {

        switch (nombre) {

            case "Companies":
                return typeof Companies !== "undefined" ? Companies : null;

            case "Contacts":
                return typeof Contacts !== "undefined" ? Contacts : null;

            case "Appointments":
                return typeof Appointments !== "undefined" ? Appointments : null;

            case "Quotes":
                return typeof Quotes !== "undefined" ? Quotes : null;

            case "Users":
                return typeof Users !== "undefined" ? Users : null;

            case "Roles":
                return typeof Roles !== "undefined" ? Roles : null;

            default:
                return null;

        }

    }

    function registros(nombre) {

        const repositorio =
            repositorioDe(nombre);

        if (!repositorio?.findAll) {

            return null;

        }

        repositorio.load?.();

        return repositorio.findAll();

    }

    function poner(id, valor) {

        const nodo =
            document.getElementById(id);

        if (nodo) {

            nodo.textContent = valor;

        }

    }

    /*
    * Los importes se escriben como se leen en España, con el euro
    * detrás y la coma decimal. Sin esto, el total del negocio
    * salía como "36521.35", que no es una cifra que nadie enseñe
    * en un panel.
    */

    function importe(cantidad) {

        return cantidad.toLocaleString("es-ES", {

            style: "currency",

            currency: "EUR",

            maximumFractionDigits: 0

        });

    }

    function cuantos(cantidad, singular, plural) {

        return `${cantidad} ${cantidad === 1 ? singular : plural}`;

    }

    /*
    |----------------------------------------------------------
    | Contadores
    |----------------------------------------------------------
    */

    const empresas =
        registros("Companies");

    const contactos =
        registros("Contacts");

    const citas =
        registros("Appointments");

    const presupuestos =
        registros("Quotes");

    poner("companiesCount", empresas ? empresas.length : "-");

    poner("contactsCount", contactos ? contactos.length : "-");

    poner("agendaCount", citas ? citas.length : "-");

    poner("quotesCount", presupuestos ? presupuestos.length : "-");

    if (citas) {

        poner(
            "agendaHint",
            cuantos(
                citas.filter(cita => cita.status === "Pendiente").length,
                "pendiente",
                "pendientes"
            )
        );

    }

    /*
    |----------------------------------------------------------
    | El dinero
    |----------------------------------------------------------
    |
    | En curso es lo que sigue sobre la mesa: todo menos lo
    | aceptado, lo rechazado y lo cancelado. Aceptado es lo
    | ganado.
    |
    | Los estados se nombran aquí una sola vez y salen de los del
    | repositorio: si mañana aparece un estado nuevo, entra en
    | "en curso" por descarte, que es lo que se quiere. Al revés
    | —listando los estados en curso— un estado nuevo no contaría
    | en ningún sitio y el panel mentiría sin avisar.
    */

    if (presupuestos && typeof Quotes !== "undefined") {

        const CERRADOS =
            ["Aceptado", "Rechazado", "Cancelado"];

        const ACEPTADO = "Aceptado";

        const total =
            lista => lista.reduce(
                (suma, quote) => suma + Quotes.totales(quote).total,
                0
            );

        const enCurso =
            presupuestos.filter(quote => !CERRADOS.includes(quote.status));

        const aceptados =
            presupuestos.filter(quote => quote.status === ACEPTADO);

        poner("quotesOpenAmount", importe(total(enCurso)));

        poner(
            "quotesOpenHint",
            `${cuantos(enCurso.length, "presupuesto", "presupuestos")}, IVA incluido`
        );

        poner("quotesWonAmount", importe(total(aceptados)));

        poner(
            "quotesWonHint",
            `${cuantos(aceptados.length, "presupuesto", "presupuestos")}, IVA incluido`
        );

    }

    /*
    |----------------------------------------------------------
    | Las últimas acciones
    |----------------------------------------------------------
    */

    const lista =
        document.getElementById("ultimasAcciones");

    const vacio =
        document.getElementById("ultimasAccionesVacio");

    if (!lista || typeof Log === "undefined") {

        return;

    }

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    const CLASES = {

        [Log.ACCIONES.ALTA]: "active",

        [Log.ACCIONES.EDICION]: "pending",

        [Log.ACCIONES.BAJA]: "inactive"

    };

    const ultimas =
        Log.ultimas(8);

    lista.innerHTML =

        ultimas.map(linea => `
<li class="accion">

    <span class="badge ${CLASES[linea.accion] || "inactive"}">
        ${escapar(linea.accion)}
    </span>

    <span class="accionQue">
        <strong>${escapar(linea.entidad)}</strong>
        ${escapar(linea.registro)}
    </span>

    <span class="accionQuien">${escapar(linea.usuario)}</span>

    <span class="accionCuando">${escapar(Log.cuando(linea.fecha))}</span>

</li>`).join("");

    if (vacio) {

        vacio.textContent =
            ultimas.length
                ? ""
                : "Todavía no se ha hecho nada. En cuanto se dé de alta, " +
                  "se cambie o se borre algo, aparecerá aquí.";

    }

})();
