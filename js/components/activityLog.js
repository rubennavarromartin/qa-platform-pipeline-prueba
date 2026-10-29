/*
|--------------------------------------------------------------------------
| Log de actividad
|--------------------------------------------------------------------------
|
| Qué se ha hecho, quién lo ha hecho y cuándo.
|
| Cada alta, cada edición y cada baja de cualquier entidad deja
| una línea aquí. Es lo que tiene cualquier aplicación
| empresarial en cuanto la usan dos personas: sin esto, "esta
| empresa la ha cambiado alguien" no se puede responder.
|
| Se anota desde los repositorios y no desde los formularios. Un
| registro se puede borrar desde la ficha, desde la fila de la
| tabla o desde la barra de "eliminar seleccionados", y son tres
| sitios distintos; por el repositorio pasan los tres. Anotarlo
| en el formulario sería tener tres sitios donde olvidarse.
|
| El tope de líneas no es un capricho: esto vive en
| localStorage, que son unos pocos megas para todo el dominio, y
| un log sin tope acabaría comiéndose el sitio de los datos.
| Cuando se llena se van las más viejas, que es lo que se espera
| de un log.
|
*/

const Log = (() => {

    const STORAGE_KEY = "qa-platform-log";

    const TOPE = 300;

    /*
    * Las tres acciones. Se escriben una sola vez aquí para que la
    * pantalla de actividad pueda ofrecerlas en un desplegable sin
    * inventárselas, y para que nadie anote "borrado" un día y
    * "baja" otro.
    */

    const ACCIONES = {

        ALTA: "Alta",

        EDICION: "Edición",

        BAJA: "Baja"

    };

    /*
    * Las líneas de partida.
    *
    * Un log recién estrenado está vacío, y una tabla vacía no se
    * puede ni buscar ni paginar: quien venga a probar esta
    * pantalla se encontraría con que no hay nada que comprobar.
    * Catorce, como los registros de partida de las demás
    * entidades, y por el mismo motivo.
    *
    * Las fechas son fijas y no calculadas: dos pasadas de la
    * misma prueba tienen que ver lo mismo.
    */

    const DE_PARTIDA = [

        { fecha: "2026-08-11T08:12:00.000Z", usuario: "Rubén Navarro", entidad: "Empresa",       accion: "Alta",    registro: "Laboratorios Ebro",         detalle: "" },
        { fecha: "2026-08-11T09:03:00.000Z", usuario: "Rubén Navarro", entidad: "Contacto",      accion: "Alta",    registro: "Lucía Ibáñez",              detalle: "" },
        { fecha: "2026-08-11T11:47:00.000Z", usuario: "Ana López",     entidad: "Presupuesto",   accion: "Alta",    registro: "PRE-2026-014",              detalle: "Laboratorios Ebro" },
        { fecha: "2026-08-11T16:20:00.000Z", usuario: "Ana López",     entidad: "Cita",          accion: "Alta",    registro: "Firma del presupuesto",     detalle: "Bosonit · 2026-09-15" },
        { fecha: "2026-08-12T07:55:00.000Z", usuario: "Marta Gil",     entidad: "Presupuesto",   accion: "Edición", registro: "PRE-2026-002",              detalle: "Creado → Entregado" },
        { fecha: "2026-08-12T10:31:00.000Z", usuario: "Marta Gil",     entidad: "Empresa",       accion: "Edición", registro: "Distribuciones Levante",    detalle: "" },
        { fecha: "2026-08-12T12:10:00.000Z", usuario: "Luis Serrano",  entidad: "Cita",          accion: "Edición", registro: "Revisión de rutas",         detalle: "Distribuciones Levante · 2026-08-19" },
        { fecha: "2026-08-12T15:42:00.000Z", usuario: "Luis Serrano",  entidad: "Contacto",      accion: "Baja",    registro: "Contacto de prueba",        detalle: "" },
        { fecha: "2026-08-13T08:05:00.000Z", usuario: "Rubén Navarro", entidad: "Usuario",       accion: "Alta",    registro: "Diego Ferrer",              detalle: "Soporte" },
        { fecha: "2026-08-13T09:18:00.000Z", usuario: "Rubén Navarro", entidad: "Rol",           accion: "Edición", registro: "Comercial",                 detalle: "Ver, Editar" },
        { fecha: "2026-08-13T13:26:00.000Z", usuario: "Elena Prieto",  entidad: "Presupuesto",   accion: "Edición", registro: "PRE-2026-001",              detalle: "Entregado → Aceptado" },
        { fecha: "2026-08-13T17:04:00.000Z", usuario: "Elena Prieto",  entidad: "Configuración", accion: "Edición", registro: "Sociedad",                  detalle: "IVA 21 %" },
        { fecha: "2026-08-14T08:33:00.000Z", usuario: "Nuria Cano",    entidad: "Presupuesto",   accion: "Baja",    registro: "PRE-2026-000",              detalle: "Duplicado" },
        { fecha: "2026-08-14T09:49:00.000Z", usuario: "Nuria Cano",    entidad: "Cita",          accion: "Baja",    registro: "Visita anulada",            detalle: "Microsoft · 2026-08-20" }

    ];

    function leer() {

        const guardado =
            localStorage.getItem(STORAGE_KEY);

        if (!guardado) {

            const partida =
                DE_PARTIDA

                    .map((linea, indice) => ({
                        ...linea,
                        id: `partida-${indice}`,
                        registroId: null
                    }))

                    .reverse();

            guardar(partida);

            return partida;

        }

        try {

            return JSON.parse(guardado);

        }
        catch {

            return [];

        }

    }

    function guardar(lineas) {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(lineas.slice(0, TOPE))

        );

    }

    /*
    * Quién está usando la aplicación. Si todavía no hay sesión
    * montada, se anota igual: un log con el autor en blanco sigue
    * diciendo qué pasó y cuándo.
    */

    function usuario() {

        return typeof Session !== "undefined"
            ? Session.usuario()
            : "";

    }

    return {

        ACCIONES,

        /*
        * Anota una línea.
        *
        *   entidad     "Empresa", "Contacto", "Cita"...
        *   accion      una de ACCIONES
        *   registro    cómo se llama lo que se ha tocado
        *   id          el suyo, para poder volver a él
        *   detalle     lo que haga falta contar además, si algo
        */

        anotar({ entidad, accion, registro, id = null, detalle = "" }) {

            const lineas =
                leer();

            lineas.unshift({

                id:
                    `${Date.now()}-${lineas.length}`,

                fecha:
                    new Date().toISOString(),

                usuario:
                    usuario(),

                entidad,

                accion,

                registro:
                    String(registro ?? ""),

                registroId:
                    id,

                detalle

            });

            guardar(lineas);

        },

        /*
        * Todas las líneas, de la más reciente a la más vieja.
        */

        todas() {

            return leer();

        },

        /*
        * Las últimas, para el resumen de la pantalla de entrada.
        */

        ultimas(cuantas = 8) {

            return leer().slice(0, cuantas);

        },

        /*
        * Las que cumplan lo que se pida. Un filtro en blanco no
        * filtra: así la pantalla puede pasar siempre los tres sin
        * mirar cuáles están puestos.
        */

        filtrar({ entidad = "", accion = "", texto = "", usuarios = [] } = {}) {

            const buscado =
                texto.trim().toLowerCase();

            return leer().filter(linea =>

                (!entidad || linea.entidad === entidad) &&

                (!accion || linea.accion === accion) &&

                (!usuarios.length || usuarios.includes(linea.usuario)) &&

                (!buscado || this.texto(linea).includes(buscado))

            );

        },

        /*
        * Por dónde busca el buscador: por todo lo que la tabla
        * enseña, la fecha incluida y tal como se lee.
        *
        * Buscaba sólo por registro, usuario y detalle. Una
        * columna que se ve y no se busca es una promesa a medias:
        * quien escribe la fecha que está leyendo se queda sin
        * ninguna fila y no entiende por qué.
        */

        texto(linea) {

            return [

                this.cuando(linea.fecha),

                linea.usuario,

                linea.entidad,

                linea.accion,

                linea.registro,

                linea.detalle

            ].join(" ").toLowerCase();

        },

        /*
        * Las entidades sobre las que hay algo anotado, para
        * ofrecerlas en el filtro. Salen de lo que hay y no de una
        * lista escrita a mano: una lista aparte se quedaría vieja
        * en cuanto apareciera una entidad nueva.
        */

        entidades() {

            return [...new Set(leer().map(linea => linea.entidad))].sort();

        },

        /*
        * Y quién ha hecho algo, para el filtro de varias opciones. Por lo
        * mismo que las entidades.
        */

        usuarios() {

            return [...new Set(leer().map(linea => linea.usuario))].sort();

        },

        /*
        * La fecha como se lee, no como se guarda. Se guarda en ISO
        * porque es lo que ordena bien y no depende de dónde esté
        * quien mira.
        */

        cuando(fecha) {

            const momento =
                new Date(fecha);

            if (Number.isNaN(momento.getTime())) {

                return "";

            }

            return momento.toLocaleString("es-ES", {

                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"

            });

        },

        /*
        * Vaciar deja el log vacío, no lo borra: quitando la
        * clave, la siguiente lectura volvería a sembrar las
        * líneas de partida y parecería que no se ha vaciado
        * nada.
        */

        vaciar() {

            guardar([]);

        },

        /*
        * Quitar una línea, la que se anotó en ese momento. La fecha la
        * distingue: se guarda al milisegundo.
        */

        quitar(fecha) {

            guardar(leer().filter(linea => linea.fecha !== fecha));

        }

    };

})();
