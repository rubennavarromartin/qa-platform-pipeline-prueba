const Roles = (() => {

    /*
    * Los permisos que se pueden conceder a un rol. Están aquí y
    * no en el formulario porque la tabla también los pinta.
    */

    const PERMISOS = [

        { id: "permView", name: "Ver" },
        { id: "permEdit", name: "Editar" },
        { id: "permDelete", name: "Eliminar" },

        /*
        * Aprobar no es un grado más de Editar: es otra cosa. Quien
        * administra la aplicación no tiene por qué poder aprobar lo que pide
        * el equipo de otro, y quien aprueba no tiene por qué poder tocar la
        * configuración.
        *
        * Y por eso el Administrador **no lo tiene**. Es a propósito, y es el
        * caso que el laboratorio no planteaba: una pantalla que el usuario
        * con el que se explora no ve.
        */

        { id: "permApprove", name: "Aprobar" },

        /*
        * Y ver los objetivos propios, que es de quien vende. El
        * Administrador tampoco lo tiene: no tiene objetivos que mirar.
        *
        * Es el segundo permiso que el usuario con el que se explora no
        * tiene, y a propósito: con uno solo se podría pensar que era un
        * caso raro.
        */

        { id: "permTargets", name: "Objetivos" },

        /*
        * Y Proyectos, que es distinto de los cuatro anteriores en algo que
        * importa: los otros **suman** sobre Ver, y éste puede ir **solo**.
        *
        * Aprobar y Objetivos abren una pantalla más a quien ya veía todas
        * las demás. Proyectos abre una pantalla a quien no ve ninguna otra:
        * el rol "Proyectos" tiene éste y no tiene Ver, así que para él la
        * aplicación entera es una pantalla, su menú tiene una entrada, y ni
        * siquiera puede abrir Inicio.
        *
        * Es el caso que faltaba para probar los permisos por los dos
        * extremos: hasta ahora todo lo que un papel no veía era **menos**, y
        * nunca tan poco.
        */

        { id: "permProjects", name: "Proyectos" }

    ];

    const roles = [

        {
            id: 1,
            name: "Administrador",
            description: "Acceso completo a todos los módulos.",
            permissions: ["Ver", "Editar", "Eliminar", "Proyectos"],
            status: "Activo"
        },

        /*
        * El rol que sólo ve Proyectos.
        *
        * No tiene Ver, y ésa es toda la gracia: su menú tiene una entrada,
        * su pantalla de entrada es Proyectos porque Inicio no la puede
        * abrir, y desde ahí no hay salida a ninguna parte. Ninguno de los
        * otros roles tiene este permiso, así que el módulo tampoco existe
        * para ellos.
        */

        {
            id: 15,
            name: "Proyectos",
            description: "Sólo ve Proyectos, y ninguna pantalla más.",
            permissions: ["Proyectos"],
            status: "Activo"
        },

        {
            id: 2,
            name: "Gestor",
            description: "Gestiona empresas y contactos, sin borrar, y tiene objetivos.",
            permissions: ["Ver", "Editar", "Objetivos"],
            status: "Activo"
        },

        {
            id: 3,
            name: "Consulta",
            description: "Sólo lectura.",
            permissions: ["Ver"],
            status: "Inactivo"
        },

        {
            id: 4,
            name: "Supervisor",
            description: "Revisa el trabajo del equipo, corrige y aprueba.",
            permissions: ["Ver", "Editar", "Aprobar"],
            status: "Activo"
        },

        {
            id: 5,
            name: "Comercial",
            description: "Gestiona sus propias empresas y citas, y tiene objetivos.",
            permissions: ["Ver", "Editar", "Objetivos"],
            status: "Activo"
        },

        {
            id: 6,
            name: "Facturación",
            description: "Consulta empresas y emite facturas.",
            permissions: ["Ver"],
            status: "Activo"
        },

        {
            id: 7,
            name: "Soporte",
            description: "Atiende incidencias de los clientes.",
            permissions: ["Ver", "Editar"],
            status: "Activo"
        },

        {
            id: 8,
            name: "Auditor",
            description: "Lee todo y no cambia nada.",
            permissions: ["Ver"],
            status: "Activo"
        },

        {
            id: 9,
            name: "Almacén",
            description: "Gestiona existencias y albaranes.",
            permissions: ["Ver", "Editar"],
            status: "Inactivo"
        },

        {
            id: 10,
            name: "Marketing",
            description: "Explota los datos de contacto.",
            permissions: ["Ver"],
            status: "Activo"
        },

        {
            id: 11,
            name: "Dirección",
            description: "Acceso completo, sin tareas operativas.",
            permissions: ["Ver", "Editar", "Eliminar"],
            status: "Activo"
        },

        {
            id: 12,
            name: "Recepción",
            description: "Da de alta contactos y concierta citas.",
            permissions: ["Ver", "Editar"],
            status: "Activo"
        },

        {
            id: 13,
            name: "Becario",
            description: "Consulta acompañada, sin cambios.",
            permissions: ["Ver"],
            status: "Inactivo"
        },

        {
            id: 14,
            name: "Solo lectura",
            description: "Perfil de invitado.",
            permissions: ["Ver"],
            status: "Activo"
        }

    ];

    /*
    * Los roles tal y como los trae el código, para poder comparar con lo
    * guardado. Es una copia y no la misma lista: `roles` se vacía al cargar
    * lo de `localStorage`, y si fuera la misma referencia no quedaría nada
    * con qué comparar.
    */

    const DE_FABRICA =
        roles.map(uno => ({ ...uno, permissions: [...(uno.permissions || [])] }));

    const STORAGE_KEY = "qa-platform-roles";

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad.
    */

    function anotar(accion, role) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Rol",

            accion: Log.ACCIONES[accion],

            registro: role?.name,

            id: role?.id,

            detalle:
                (role?.permissions || []).join(", ")

        });

    }

    return {

        PERMISOS,

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            roles.length = 0;

            roles.push(...JSON.parse(data));

            this.migrar();

        },

        /*
        * Los roles que trae el código y que no están en lo guardado.
        *
        * Hace falta porque los roles se siembran **la primera vez** y a
        * partir de ahí mandan los de `localStorage`. Al añadir el permiso de
        * Proyectos, el rol Administrador del código lo tenía y el guardado
        * no: el usuario principal se encontró con un 403 en una pantalla que
        * acababa de aparecer en su menú.
        *
        * Es un caso de verdad y no una torpeza del laboratorio: cualquier
        * aplicación que dé de alta permisos nuevos tiene que decidir qué
        * pasa con los roles que ya existían, y callarse es dejar a todo el
        * mundo fuera de lo que se acaba de añadir.
        *
        * Se hace por nombre y sólo se **añade**: nunca se quita un permiso
        * que alguien haya dado ni se toca un rol que alguien haya creado.
        * Quitar sería decidir por quien administra la aplicación.
        */

        migrar() {

            let tocado = false;

            for (const deFabrica of DE_FABRICA) {

                const guardado =
                    roles.find(uno => uno.name === deFabrica.name);

                if (!guardado) {

                    roles.push({ ...deFabrica });

                    tocado = true;

                    continue;

                }

                for (const permiso of deFabrica.permissions || []) {

                    if (!(guardado.permissions || []).includes(permiso)) {

                        guardado.permissions =
                            [...(guardado.permissions || []), permiso];

                        tocado = true;

                    }

                }

            }

            if (tocado) {

                this.save();

            }

        },

        findAll() {

            return [...roles];

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return roles.filter(r =>

                r.name.toLowerCase().includes(text)
                ||
                r.description.toLowerCase().includes(text)

            );

        },

        create(role) {

            role.id = Date.now();

            roles.push(role);

            this.save();

            anotar("ALTA", role);

            return role;

        },

        update(role) {

            const index = roles.findIndex(

                r => r.id === role.id

            );

            if (index >= 0) {

                roles[index] = role;

                this.save();

                anotar("EDICION", role);

            }

        },

        remove(id) {

            const index = roles.findIndex(

                r => r.id == id

            );

            if (index >= 0) {

                /*
                * El rol se lee antes de quitarlo: después ya no
                * hay de dónde sacar su nombre para el log.
                */

                const role =
                    roles[index];

                roles.splice(index, 1);

                this.save();

                anotar("BAJA", role);

            }

        },

        findById(id) {

            return roles.find(

                r => r.id == id

            );

        },

        /*
        * Los roles que se pueden asignar a un usuario. El módulo
        * de Usuarios los pide de aquí en lugar de llevar su
        * propia lista escrita a mano.
        */

        nombresActivos() {

            const data =
                localStorage.getItem(STORAGE_KEY);

            const guardados =
                data
                    ? JSON.parse(data)
                    : roles;

            return guardados

                .filter(role => role.status === "Activo")

                .map(role => role.name);

        },

        save() {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(roles)

            );

        }

    };

})();
