/*
|--------------------------------------------------------------------------
| Quotes
|--------------------------------------------------------------------------
|
| Los presupuestos, que es la primera entidad del laboratorio con
| dos cosas que las otras no tienen.
|
| Una: **líneas**. Un presupuesto no es una fila con campos, es una
| cabecera con un número indeterminado de líneas debajo y unos
| totales que salen de sumarlas. Nada de lo que había hasta ahora
| se parecía a eso.
|
| Y dos: un **estado que se pasea**. Creado, entregado, aceptado,
| rechazado, cancelado. Son las columnas del kanban, y arrastrar
| una tarjeta de una a otra es cambiar el estado del registro:
| editar sin abrir un formulario.
|
| Las cuentas se hacen aquí y no en la pantalla. Una pantalla que
| calcula sus propios totales es una pantalla que puede enseñar un
| total distinto del que se guarda, y entonces no se sabe cuál de
| los dos está mal.
|
*/

const Quotes = (() => {

    /*
    * Los estados, en el orden en que van pasando. El orden importa:
    * es el de las columnas del kanban, y "cancelado" va al final
    * porque se puede llegar desde cualquiera.
    */

    const ESTADOS = [

        "Creado",
        "Entregado",
        "Aceptado",
        "Rechazado",
        "Cancelado"

    ];

    /*
    * El IVA. Uno solo y general, porque lo que el laboratorio tiene
    * que ofrecer es un totalizador con sus escalones, no una
    * fiscalidad.
    *
    * Ya no es una constante: es un parámetro de la sociedad y se
    * cambia desde Configuración. Se pregunta cada vez que se
    * calcula y no se guarda en una variable, porque puede cambiar
    * mientras la pantalla está abierta.
    *
    * El 21 sigue aquí de respaldo para cuando una pantalla no
    * haya cargado la configuración: un total mal calculado sería
    * peor que un total con el tipo de siempre.
    */

    const IVA_POR_DEFECTO = 21;

    function tipoIva() {

        return typeof Settings !== "undefined"
            ? Settings.iva()
            : IVA_POR_DEFECTO;

    }

    const STORAGE_KEY = "qa-platform-quotes";

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad. Mover una tarjeta del kanban cuenta como
    * edición, y por eso `anotar` admite un detalle.
    */

    function anotar(accion, quote, detalle = "") {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Presupuesto",

            accion: Log.ACCIONES[accion],

            registro: quote?.code,

            id: quote?.id,

            detalle:
                detalle || quote?.company || ""

        });

    }

    /*
    * Catorce, como las demás entidades, y por el mismo motivo: con
    * menos de los que caben en una página la paginación no se
    * activaría nunca mientras se prueba.
    *
    * Las empresas son las que existen en el módulo de Empresas. Si
    * aquí hubiera un cliente inventado, la relación no se podría
    * recorrer y el kanban enseñaría tarjetas que no llevan a
    * ninguna parte.
    */

    const quotes = [

        {
            id: 1,
            code: "PRE-2026-001",
            company: "Bosonit",
            createdAt: "2026-01-15",
            status: "Aceptado",
            discount: 5,
            lines: [
                { id: 1, description: "Análisis funcional", units: 20, price: 65, discount: 0 },
                { id: 2, description: "Desarrollo del módulo de facturación", units: 80, price: 55, discount: 10 }
            ]
        },

        {
            id: 2,
            code: "PRE-2026-002",
            company: "Babel",
            createdAt: "2026-01-22",
            status: "Entregado",
            discount: 0,
            lines: [
                { id: 1, description: "Consultoría de arquitectura", units: 15, price: 90, discount: 0 }
            ]
        },

        {
            id: 3,
            code: "PRE-2026-003",
            company: "Microsoft",
            createdAt: "2026-02-03",
            status: "Rechazado",
            discount: 0,
            lines: [
                { id: 1, description: "Migración a la nube", units: 120, price: 70, discount: 5 },
                { id: 2, description: "Formación al equipo", units: 8, price: 120, discount: 0 }
            ]
        },

        {
            id: 4,
            code: "PRE-2026-004",
            company: "Aceros del Norte",
            createdAt: "2026-02-11",
            status: "Creado",
            discount: 0,
            lines: [
                { id: 1, description: "Mantenimiento anual", units: 12, price: 350, discount: 0 }
            ]
        },

        {
            id: 5,
            code: "PRE-2026-005",
            company: "Bodegas Riojanas",
            createdAt: "2026-02-19",
            status: "Aceptado",
            discount: 10,
            lines: [
                { id: 1, description: "Tienda en línea", units: 60, price: 60, discount: 0 },
                { id: 2, description: "Pasarela de pago", units: 25, price: 75, discount: 0 }
            ]
        },

        {
            id: 6,
            code: "PRE-2026-006",
            company: "Clínica Sanitas",
            createdAt: "2026-03-02",
            status: "Entregado",
            discount: 0,
            lines: [
                { id: 1, description: "Cuadro de mando de citas", units: 45, price: 68, discount: 0 }
            ]
        },

        {
            id: 7,
            code: "PRE-2026-007",
            company: "Distribuciones Levante",
            createdAt: "2026-03-10",
            status: "Cancelado",
            discount: 0,
            lines: [
                { id: 1, description: "Integración con el ERP", units: 90, price: 72, discount: 0 }
            ]
        },

        {
            id: 8,
            code: "PRE-2026-008",
            company: "Editorial Cantábrico",
            createdAt: "2026-03-18",
            status: "Creado",
            discount: 0,
            lines: [
                { id: 1, description: "Catálogo digital", units: 35, price: 58, discount: 0 },
                { id: 2, description: "Buscador de títulos", units: 20, price: 65, discount: 5 }
            ]
        },

        {
            id: 9,
            code: "PRE-2026-009",
            company: "Ferretería Central",
            createdAt: "2026-04-01",
            status: "Entregado",
            discount: 0,
            lines: [
                { id: 1, description: "Control de inventario", units: 50, price: 62, discount: 0 }
            ]
        },

        {
            id: 10,
            code: "PRE-2026-010",
            company: "Gestoría Duero",
            createdAt: "2026-04-09",
            status: "Aceptado",
            discount: 3,
            lines: [
                { id: 1, description: "Portal del cliente", units: 70, price: 64, discount: 0 }
            ]
        },

        {
            id: 11,
            code: "PRE-2026-011",
            company: "Hoteles Atlántico",
            createdAt: "2026-04-17",
            status: "Rechazado",
            discount: 0,
            lines: [
                { id: 1, description: "Motor de reservas", units: 110, price: 78, discount: 0 }
            ]
        },

        {
            id: 12,
            code: "PRE-2026-012",
            company: "Industrias Guadalquivir",
            createdAt: "2026-05-05",
            status: "Creado",
            discount: 0,
            lines: [
                { id: 1, description: "Trazabilidad de producción", units: 95, price: 74, discount: 0 }
            ]
        },

        {
            id: 13,
            code: "PRE-2026-013",
            company: "Joyería Mediterránea",
            createdAt: "2026-05-13",
            status: "Entregado",
            discount: 0,
            lines: [
                { id: 1, description: "Escaparate en línea", units: 40, price: 60, discount: 0 }
            ]
        },

        {
            id: 14,
            code: "PRE-2026-014",
            company: "Laboratorios Ebro",
            createdAt: "2026-05-21",
            status: "Creado",
            discount: 0,
            lines: [
                { id: 1, description: "Gestión de muestras", units: 55, price: 69, discount: 0 },
                { id: 2, description: "Informes de laboratorio", units: 30, price: 71, discount: 0 }
            ]
        }

    ];

    /*
    * El dinero se redondea a dos decimales en cada escalón, y no
    * sólo al final.
    *
    * Sumando sin redondear, el total que se guarda y el que sale de
    * sumar lo que la pantalla enseña se separan por céntimos, y
    * entonces no hay manera de decir cuál de los dos está mal. Que
    * cuadre lo que se ve es parte de lo que hay que poder probar.
    */

    function redondear(importe) {

        return Math.round((Number(importe) || 0) * 100) / 100;

    }

    /*
    * El total de una línea: unidades por precio, menos su
    * descuento.
    *
    * El descuento va en porcentaje y no en euros porque es como lo
    * pide quien hace un presupuesto: "un diez por ciento en esta
    * línea".
    */

    function totalDeLinea(linea) {

        const bruto =
            (Number(linea.units) || 0) * (Number(linea.price) || 0);

        const descuento =
            bruto * ((Number(linea.discount) || 0) / 100);

        return redondear(bruto - descuento);

    }

    /*
    * El pie: los cuatro escalones que llevan de las líneas al total
    * del presupuesto.
    *
    * Se devuelven todos, no sólo el último. Un total sin sus
    * escalones no se puede comprobar: si sale mal, no se sabe si
    * está mal la suma, el descuento o el impuesto.
    */

    function totales(quote) {

        const lineas =
            quote?.lines || [];

        const suma =
            redondear(
                lineas.reduce(
                    (total, linea) => total + totalDeLinea(linea),
                    0
                )
            );

        const descuento =
            redondear(suma * ((Number(quote?.discount) || 0) / 100));

        const base =
            redondear(suma - descuento);

        const iva =
            redondear(base * (tipoIva() / 100));

        return {

            suma,

            descuento,

            base,

            iva,

            total:
                redondear(base + iva)

        };

    }

    return {

        ESTADOS,

        iva: tipoIva,

        totalDeLinea,

        totales,

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            quotes.length = 0;

            quotes.push(...JSON.parse(data));

        },

        findAll() {

            return [...quotes];

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return quotes.filter(q =>

                q.code.toLowerCase().includes(text)
                ||
                q.company.toLowerCase().includes(text)
                ||
                q.status.toLowerCase().includes(text)

            );

        },

        /*
        * El alta.
        *
        * El código no se puede repetir, y esto es lo último que lo
        * comprueba: el formulario ya avisa y propone un hueco, pero el
        * repositorio es quien guarda, y dejar la unicidad sólo en la
        * pantalla es dejarla en el sitio donde no se cumple si alguien
        * llama a esto desde otra.
        *
        * Se contesta con un error en lugar de callar y no guardar: quien
        * llama tiene que poder decir qué ha pasado.
        */

        create(quote) {

            if (typeof Codigos !== "undefined" && Codigos.estaCogido(quote.code)) {

                throw new Error(
                    `Ya existe un presupuesto con el código ${quote.code}.`
                );

            }

            quote.id = Date.now();

            quotes.push(quote);

            this.save();

            /*
            * Y el contador avanza si este código lo pasa. Después de
            * guardar: el contador se calcula mirando lo que hay, y si se
            * hiciera antes se estaría contando sin este presupuesto.
            */

            if (typeof Codigos !== "undefined") {

                Codigos.avanzarHasta(quote.code);

            }

            anotar("ALTA", quote);

            return quote;

        },

        update(quote) {

            if (
                typeof Codigos !== "undefined" &&
                Codigos.estaCogido(quote.code, quote.id)
            ) {

                throw new Error(
                    `Ya existe un presupuesto con el código ${quote.code}.`
                );

            }

            const index = quotes.findIndex(

                q => q.id === quote.id

            );

            if (index >= 0) {

                quotes[index] = quote;

                this.save();

                if (typeof Codigos !== "undefined") {

                    Codigos.avanzarHasta(quote.code);

                }

                anotar("EDICION", quote);

            }

        },

        remove(id) {

            const index = quotes.findIndex(

                q => q.id == id

            );

            if (index >= 0) {

                /*
                * El presupuesto se lee antes de quitarlo: después
                * ya no hay de dónde sacar su código para el log.
                */

                const quote =
                    quotes[index];

                quotes.splice(index, 1);

                this.save();

                /*
                * Si el que se va era el último de su serie, el contador
                * retrocede para que su hueco sea el que se ofrezca. Se
                * hace después de quitarlo, porque el contador se calcula
                * mirando lo que queda.
                */

                if (typeof Codigos !== "undefined") {

                    Codigos.retrocederPor(quote.code);

                }

                anotar("BAJA", quote);

            }

        },

        findById(id) {

            return quotes.find(

                q => q.id == id

            );

        },

        /*
        * Cambiar el estado y nada más.
        *
        * Existe porque el kanban lo necesita: arrastrar una tarjeta
        * cambia una cosa del registro, no lo reescribe. Guardando el
        * registro entero desde el kanban, cualquier cosa que la
        * tarjeta no lleve encima —las líneas— se perdería.
        */

        cambiarEstado(id, estado) {

            const quote =
                this.findById(id);

            if (!quote || !ESTADOS.includes(estado)) {

                return null;

            }

            const anterior =
                quote.status;

            quote.status = estado;

            this.save();

            /*
            * Mover una tarjeta del kanban también es editar el
            * presupuesto, y en el log se cuenta de dónde a dónde:
            * "PRE-2026-004: Creado → Entregado" dice lo que pasó;
            * "editado", no.
            */

            anotar("EDICION", quote, `${anterior} → ${estado}`);

            return quote;

        },

        /*
        * Los presupuestos de una empresa. Hace falta para su ficha
        * y para no borrarla por debajo.
        */

        findByCompany(company) {

            return quotes.filter(q => q.company === company);

        },

        /*
        * Y los códigos, para quien tenga que ofrecerlos: una cita
        * puede concertarse para presentar un presupuesto.
        *
        * Se lee de lo guardado y no de la memoria porque quien
        * pregunta suele ser otra pantalla, que no ha cargado este
        * repositorio.
        */

        /*
        * Los códigos con su identificador, que es lo que hace falta para
        * comprobar que no se repite uno: el que se está editando no choca
        * consigo mismo, y para saberlo hay que poder distinguirlo.
        */

        codigosConId() {

            const guardados =
                localStorage.getItem(STORAGE_KEY);

            return (
                guardados
                    ? JSON.parse(guardados)
                    : quotes
            ).map(q => ({ id: q.id, code: q.code }));

        },

        codigos() {

            const guardados =
                localStorage.getItem(STORAGE_KEY);

            return (
                guardados
                    ? JSON.parse(guardados)
                    : quotes
            ).map(q => q.code);

        },

        save() {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(quotes)

            );

        }

    };

})();
