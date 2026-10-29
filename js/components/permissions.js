/*
|--------------------------------------------------------------------------
| Permisos
|--------------------------------------------------------------------------
|
| Qué puede hacer quien ha entrado.
|
| No se inventa una lista de permisos: los saca del módulo de
| Roles, que ya los tenía —Ver, Editar y Eliminar— y ya deja
| dárselos a un rol con unas casillas. Cada usuario tiene un rol,
| y ese rol dice lo que puede.
|
| Con eso, tres pantallas que hasta ahora eran tres CRUD sueltos
| —Usuarios, Roles y la de acceso— pasan a estar conectadas: se
| cambia un permiso en Roles y cambia lo que se ve en Empresas.
| Para la plataforma es un caso nuevo: la misma pantalla enseña
| unos botones u otros según quién entre.
|
| Los botones que no se pueden usar se esconden desde CSS, con un
| atributo en el `body`, y no uno a uno según se pintan: las
| filas de las tablas se repintan cada vez que se busca, se
| ordena o se pasa de página, y habría que acordarse en todos
| esos sitios. Esconderlos no es impedirlos —esto es un
| laboratorio, no un sistema seguro—, así que las acciones
| comprueban además el permiso antes de hacer nada.
|
*/

const Permissions = (() => {

    const VER = "Ver";

    const EDITAR = "Editar";

    const ELIMINAR = "Eliminar";

    const APROBAR = "Aprobar";

    const OBJETIVOS = "Objetivos";

    /*
    * El permiso de Proyectos, que es el que plantea el caso límite.
    *
    * Hasta ahora todos los permisos **sumaban**: quien tenía Aprobar veía
    * Aprobaciones *además* de todo lo demás, porque todo lo demás sólo pedía
    * Ver y Ver lo tenían todos. Éste es el primero que puede ir **solo**: hay
    * un rol que tiene Proyectos y no tiene Ver, y para él la aplicación es
    * una pantalla y nada más.
    */

    const PROYECTOS = "Proyectos";

    /*
    * Qué permiso hace falta para abrir cada pantalla.
    *
    * Se decide por módulo y no por pantalla suelta porque es como lo decide
    * una aplicación de verdad: los permisos son de áreas, no de ficheros.
    *
    * Las dos de administración piden Editar: no es un permiso nuevo, quien
    * puede editar entra y quien sólo mira, no.
    *
    * Y las dos últimas piden permisos que **el Administrador no tiene**. Ésa
    * es la gracia: son pantallas que no ve el usuario con el que se explora,
    * y hasta que existieron el laboratorio no planteaba ese caso — todo lo
    * que no veía un papel era menos, nunca otra cosa.
    *
    * Aprobaciones pide Aprobar, y Mis cifras pide Objetivos. Son dos y no
    * una a propósito: con una sola se podría pensar que era un caso raro.
    */

    const NECESITAN = {

        users:        EDITAR,
        roles:        EDITAR,
        aprobaciones: APROBAR,
        kpis:         OBJETIVOS,

        /*
        * Y desde el 16 de septiembre de 2026, lo que antes estaba implícito
        * se escribe: los módulos de datos piden Ver.
        *
        * No cambia nada para los roles que ya había —todos tienen Ver— y es
        * lo que hace posible el que no lo tiene. Antes, un módulo que no
        * estuviera en esta lista lo veía cualquiera, así que "un rol que sólo
        * ve Proyectos" no se podía declarar: habría visto también Empresas,
        * Contactos, Agenda y Presupuestos por no estar dichas.
        *
        * Inicio entra en la lista, y ésa es la parte que tiene consecuencias:
        * **la pantalla de entrada deja de ser la misma para todos**.
        */

        home:         VER,
        companies:    VER,
        contacts:     VER,
        agenda:       VER,
        quotes:       VER,
        panel:        VER,
        settings:     VER,
        activity:     VER,
        informes:     VER,
        profile:      VER,

        /*
        * Y Ayuda, que se escribe `ayuda` y no `help`.
        *
        * Lo dice el menú, que es quien pone las claves. Estaba puesta en
        * inglés y no coincidía con ninguna, así que Ayuda no pedía permiso:
        * el rol que sólo ve Proyectos la veía en su menú. Un mapa de
        * permisos con una clave que no existe no falla — deja pasar, que es
        * la manera silenciosa de equivocarse.
        */

        ayuda:        VER,

        projects:     PROYECTOS

    };

    /*
    * Sin sesión no hay permisos, y sin módulo de Roles cargado
    * tampoco hay de dónde sacarlos: en ese caso se deja hacer
    * todo. Es lo contrario de lo que haría una aplicación real,
    * y es lo que quiere el laboratorio: una pantalla suelta que
    * se abra sin acceso tiene que seguir enseñando lo que
    * enseñaba.
    */

    function permisosDelRol(nombre) {

        if (typeof Roles === "undefined") {

            return [VER, EDITAR, ELIMINAR];

        }

        Roles.load?.();

        const rol =
            Roles.findAll().find(r => r.name === nombre);

        return rol
            ? (rol.permissions || [])
            : [VER];

    }

    /*
    * Qué permiso hace falta para pulsar cada cosa.
    *
    * Se vigila el clic de toda la pantalla en fase de captura, y
    * no botón a botón: las filas de las tablas se repintan al
    * buscar, al ordenar y al pasar de página, y un enganche por
    * botón habría que rehacerlo cada vez. En captura además se
    * llega antes que el `onclick` de la fila, que es lo que hay
    * que impedir.
    */

    const VIGILADOS = [

        { selector: ".btn-delete,.btn-document-delete,.btn-comment-delete", permiso: ELIMINAR },

        { selector: ".btn-primary,.btn-edit,.kanban-mover button", permiso: EDITAR }

    ];

    let vigilando = false;

    function vigilar() {

        if (vigilando) {

            return;

        }

        vigilando = true;

        document.addEventListener("click", evento => {

            for (const { selector, permiso } of VIGILADOS) {

                if (!evento.target.closest(selector)) {

                    continue;

                }

                if (Permissions.puede(permiso)) {

                    return;

                }

                evento.preventDefault();

                evento.stopPropagation();

                Permissions.exigir(permiso);

                return;

            }

        }, true);

    }

    return {

        VER,

        EDITAR,

        ELIMINAR,

        APROBAR,

        OBJETIVOS,

        /*
        * El rol de quien ha entrado.
        */

        rol() {

            if (typeof Session === "undefined" || !Session.actual) {

                return null;

            }

            return Session.actual()?.role || null;

        },

        permisos() {

            const rol =
                this.rol();

            return rol
                ? permisosDelRol(rol)
                : [VER, EDITAR, ELIMINAR];

        },

        /*
        * Si quien ha entrado puede siquiera abrir esta pantalla.
        *
        * Esconder la entrada del menú no es impedir la pantalla: quien
        * escriba la dirección a mano llega igual, y eso es exactamente lo
        * que hay que poder probar. Lo comprueba el menú al montarse, que es
        * lo único que tienen en común las pantallas.
        */

        puedeEntrar(clave) {

            const necesita =
                NECESITAN[clave];

            return !necesita || this.puede(necesita);

        },

        puede(permiso) {

            return this.permisos().includes(permiso);

        },

        /*
        * A dónde va quien acaba de entrar.
        *
        * Hasta ahora era Inicio para todos, y dejó de valer el día que
        * apareció alguien que no puede ver Inicio: le habría salido la
        * pantalla de "no tienes permiso" nada más identificarse, que es una
        * manera muy fea de empezar.
        *
        * Se devuelve **la primera pantalla que pueda ver**, en el orden del
        * menú. Es lo que hace cualquier aplicación con perfiles distintos, y
        * de paso plantea una pregunta que este laboratorio no planteaba: la
        * pantalla de entrada **no es la misma para todo el mundo**, así que
        * "la primera que se visita" deja de identificar a una sola.
        *
        * Y si no puede ver ninguna, Inicio: se le enseñará que no tiene
        * permiso, que es la verdad y es mejor que una pantalla en blanco.
        */

        primeraPantalla() {

            const ORDEN = [

                { clave: "home",     donde: "index.html" },
                { clave: "projects", donde: "projects.html" },
                { clave: "companies", donde: "companies.html" },
                { clave: "contacts", donde: "contacts.html" },
                { clave: "agenda",   donde: "agenda.html" },
                { clave: "quotes",   donde: "quotes.html" },
                { clave: "panel",    donde: "panel.html" },
                { clave: "aprobaciones", donde: "approvals.html" },
                { clave: "kpis",     donde: "kpis.html" }

            ];

            const suya =
                ORDEN.find(pantalla => this.puedeEntrar(pantalla.clave));

            return suya ? suya.donde : "index.html";

        },

        /*
        * Lo escribe en el `body` para que las hojas de estilo
        * puedan esconder lo que no se puede usar, se pinte
        * cuando se pinte.
        */

        aplicar() {

            const cuerpo =
                document.body;

            if (!cuerpo) {

                return;

            }

            cuerpo.dataset.puedeEditar =
                this.puede(EDITAR) ? "si" : "no";

            cuerpo.dataset.puedeEliminar =
                this.puede(ELIMINAR) ? "si" : "no";

            vigilar();

        },

        /*
        * La respuesta cuando alguien intenta lo que no puede.
        * Devuelve si se puede seguir, para que quien llama lo use
        * como guarda:
        *
        *     if (!Permissions.exigir(Permissions.ELIMINAR)) return;
        */

        exigir(permiso) {

            if (this.puede(permiso)) {

                return true;

            }

            if (typeof Toast !== "undefined") {

                Toast.mostrar(
                    `Tu rol (${this.rol() || "sin rol"}) no permite ${permiso.toLowerCase()}.`,
                    "error"
                );

            }

            return false;

        }

    };

})();
