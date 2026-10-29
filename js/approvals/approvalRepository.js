/*
|--------------------------------------------------------------------------
| Aprobaciones
|--------------------------------------------------------------------------
|
| Los descuentos que alguien pide y otro aprueba.
|
| Es lo que le faltaba al laboratorio para plantear el caso de las
| aprobaciones: un dato que **no crea quien lo resuelve**. Las
| solicitudes vienen de partida —las pide un comercial— y quien
| entra en esta pantalla las aprueba o las rechaza, pero no puede
| dárselas a sí mismo.
|
| Y para la plataforma plantea algo más gordo, que es la razón de
| que exista: esta pantalla **no la ve el usuario con el que se
| explora**. Pide el permiso "Aprobar", que el Administrador no
| tiene. Todo lo que un papel no veía hasta ahora era menos —un
| botón, una pantalla cerrada—; esto es otra cosa, y si nadie
| explora con quien la ve, no la prueba nadie.
|
| Sin alta y sin edición a propósito: lo que se hace aquí es
| decidir, y decidir son dos botones. Un formulario de alta
| convertiría la pantalla en otro CRUD de los seis que ya hay.
|
*/

const Aprobaciones = (() => {

    const STORAGE_KEY = "qa-platform-aprobaciones";

    const PENDIENTE = "Pendiente";

    const APROBADA = "Aprobada";

    const RECHAZADA = "Rechazada";

    /*
    * De partida, cinco pendientes y dos ya resueltas. Las dos
    * resueltas hacen falta para que la pantalla tenga los tres
    * estados desde el principio: una tabla donde todo dice lo
    * mismo no enseña que la columna signifique algo.
    */

    const solicitudes = [

        {
            id: 1,
            codigo: "SOL-2026-001",
            solicitante: "Luis Ortega",
            presupuesto: "PRE-2026-002",
            descuento: 15,
            estado: PENDIENTE
        },

        {
            id: 2,
            codigo: "SOL-2026-002",
            solicitante: "Pablo Marín",
            presupuesto: "PRE-2026-004",
            descuento: 22,
            estado: PENDIENTE
        },

        {
            id: 3,
            codigo: "SOL-2026-003",
            solicitante: "Luis Ortega",
            presupuesto: "PRE-2026-007",
            descuento: 12,
            estado: PENDIENTE
        },

        {
            id: 4,
            codigo: "SOL-2026-004",
            solicitante: "Sara Bermejo",
            presupuesto: "PRE-2026-009",
            descuento: 30,
            estado: PENDIENTE
        },

        {
            id: 5,
            codigo: "SOL-2026-005",
            solicitante: "Pablo Marín",
            presupuesto: "PRE-2026-011",
            descuento: 18,
            estado: PENDIENTE
        },

        {
            id: 6,
            codigo: "SOL-2026-006",
            solicitante: "Luis Ortega",
            presupuesto: "PRE-2026-003",
            descuento: 10,
            estado: APROBADA
        },

        {
            id: 7,
            codigo: "SOL-2026-007",
            solicitante: "Sara Bermejo",
            presupuesto: "PRE-2026-005",
            descuento: 40,
            estado: RECHAZADA
        }

    ];

    const DE_PARTIDA =
        solicitudes.map(una => ({ ...una }));

    return {

        PENDIENTE,

        APROBADA,

        RECHAZADA,

        load() {

            const guardado =
                localStorage.getItem(STORAGE_KEY);

            if (!guardado) {

                this.save();

                return;

            }

            solicitudes.length = 0;

            solicitudes.push(...JSON.parse(guardado));

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(solicitudes)
            );

        },

        findAll() {

            return [...solicitudes];

        },

        findById(id) {

            return solicitudes.find(
                una => String(una.id) === String(id)
            ) || null;

        },

        /*
        * Lo que pasa la búsqueda: el código, quién la pide y el
        * presupuesto. El descuento no, que es un número y buscar
        * "15" traería también el 150.
        */

        search(texto) {

            const busca =
                String(texto || "").trim().toLowerCase();

            if (!busca) {

                return this.findAll();

            }

            return solicitudes.filter(una =>

                [una.codigo, una.solicitante, una.presupuesto]
                    .join(" ")
                    .toLowerCase()
                    .includes(busca)

            );

        },

        /*
        * Decidir. Se anota en la actividad, como todo lo que
        * cambia un registro: quien mira el log tiene que poder
        * ver quién aprobó qué.
        *
        * Y sólo se decide lo que está pendiente: volver a aprobar
        * lo aprobado no es una decisión, y rechazar lo que ya se
        * aprobó tampoco — para eso haría falta deshacer, que es
        * otra cosa y no está.
        */

        decidir(id, estado) {

            const una =
                this.findById(id);

            if (!una || una.estado !== PENDIENTE) {

                return null;

            }

            una.estado = estado;

            this.save();

            if (typeof ActivityLog !== "undefined") {

                ActivityLog.anotar({
                    entidad: "Aprobaciones",
                    accion: "Edición",
                    registro: una.codigo,
                    detalle: `Solicitud ${estado.toLowerCase()}`
                });

            }

            return una;

        }

    };

})();
