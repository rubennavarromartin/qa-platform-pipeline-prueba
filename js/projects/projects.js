/*
|--------------------------------------------------------------------------
| Proyectos
|--------------------------------------------------------------------------
|
| Un proyecto cuelga de una empresa, y una empresa puede tener muchos. Tiene
| un estado del catálogo de Configuración, una fecha de entrega, una persona
| propietaria y un avance en tanto por ciento.
|
| Qué plantea este módulo que no planteaba ninguno
|
|   **Un módulo que casi nadie ve.** Los demás se ven o no se ven enteros
|   según el permiso de siempre; éste pide uno propio, y hay un rol que
|   **sólo** tiene ése. Así aparecen los dos límites a la vez: alguien que
|   entra aquí y en ninguna otra parte, y los que entran en todas menos en
|   ésta.
|
|   Hasta ahora el laboratorio tenía pantallas que un papel no veía —
|   Aprobaciones, Mis cifras— pero el papel que las veía veía además todo lo
|   demás. Que exista alguien cuyo menú tiene **una sola entrada** es un caso
|   nuevo, y es de los que rompen cosas: un menú de uno, una pantalla de
|   entrada a la que no puede ir, y ninguna salida a ninguna parte.
|
| El avance es un número y no una barra
|
|   Se guarda `avance` de 0 a 100 y la ficha lo pinta como barra. Lo que se
|   puede comprobar es el número —lo dice el texto al lado— y no el dibujo:
|   de una barra no se lee ningún dato, igual que de una gráfica.
|
*/

const Projects = (() => {

    const STORAGE_KEY = "qa-platform-projects";

    const projects = [

        {
            id: 1,
            name: "Portal de clientes",
            companyId: 1,
            statusId: 2,
            owner: "Marta Ruiz",
            dueDate: "2026-10-30",
            avance: 68,
            equipo: 6,
            description: "Portal de autoservicio para los clientes de la cuenta."
        },

        {
            id: 2,
            name: "Migración del ERP",
            companyId: 1,
            statusId: 1,
            owner: "Juan Pérez",
            dueDate: "2027-01-15",
            avance: 10,
            equipo: 4,
            description: "Salida del ERP antiguo, por fases y sin parar la operación."
        },

        {
            id: 3,
            name: "App de campo",
            companyId: 2,
            statusId: 2,
            owner: "Ana López",
            dueDate: "2026-11-20",
            avance: 45,
            equipo: 3,
            description: "Aplicación para los equipos que trabajan fuera de la oficina."
        },

        {
            id: 4,
            name: "Cuadro de mando financiero",
            companyId: 3,
            statusId: 3,
            owner: "Carlos Ruiz",
            dueDate: "2026-06-30",
            avance: 100,
            equipo: 2,
            description: "Indicadores de cierre mensual para dirección."
        },

        {
            id: 5,
            name: "Renovación de la web",
            companyId: 4,
            statusId: 4,
            owner: "Marta Gil",
            dueDate: "2026-09-01",
            avance: 25,
            equipo: 5,
            description: "Cancelado a mitad por cambio de prioridades."
        },

        {
            id: 6,
            name: "Integración con el banco",
            companyId: 2,
            statusId: 2,
            owner: "Luis Serrano",
            dueDate: "2026-12-10",
            avance: 55,
            equipo: 3,
            description: "Conciliación automática de los movimientos."
        }

    ];

    function anotar(accion, proyecto) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Proyecto",

            accion: Log.ACCIONES[accion],

            registro: proyecto?.name,

            id: proyecto?.id

        });

    }

    return {

        load() {

            const data =
                localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            projects.length = 0;

            projects.push(...JSON.parse(data));

        },

        findAll() {

            return [...projects];

        },

        findById(id) {

            return projects.find(proyecto => proyecto.id == id) || null;

        },

        /*
        * Los de una empresa. Es la relación que pedía el caso: una empresa
        * tiene n proyectos, y desde su ficha se ven.
        */

        findByCompany(companyId) {

            return projects.filter(
                proyecto => proyecto.companyId == companyId
            );

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            const buscado =
                text.toLowerCase();

            return projects.filter(proyecto =>

                proyecto.name.toLowerCase().includes(buscado) ||

                (proyecto.owner || "").toLowerCase().includes(buscado) ||

                (this.empresaDe(proyecto) || "").toLowerCase().includes(buscado)

            );

        },

        /*
        * Cómo se llama su empresa. El proyecto guarda el identificador —que
        * es lo correcto— y quien pinta necesita el nombre.
        */

        empresaDe(proyecto) {

            if (typeof Companies === "undefined") {

                return "";

            }

            return Companies.findById(proyecto.companyId)?.name || "";

        },

        estadoDe(proyecto) {

            if (typeof ProjectStatuses === "undefined") {

                return "";

            }

            return ProjectStatuses.findById(proyecto.statusId)?.name || "";

        },

        add(proyecto) {

            const nuevo = {

                ...proyecto,

                id:
                    projects.length
                        ? Math.max(...projects.map(uno => uno.id)) + 1
                        : 1

            };

            projects.push(nuevo);

            this.save();

            anotar("ALTA", nuevo);

            return nuevo;

        },

        update(proyecto) {

            const donde =
                projects.findIndex(uno => uno.id === proyecto.id);

            if (donde >= 0) {

                projects[donde] = proyecto;

                this.save();

                anotar("EDICION", proyecto);

            }

        },

        remove(id) {

            const donde =
                projects.findIndex(uno => uno.id == id);

            if (donde < 0) {

                return;

            }

            const proyecto =
                projects[donde];

            projects.splice(donde, 1);

            this.save();

            /*
            * Y con él se van sus tareas. Dejarlas huérfanas sería dejar
            * basura que nadie ve: las tareas no tienen pantalla propia, así
            * que no habría manera de llegar a ellas ni de borrarlas.
            */

            if (typeof Tasks !== "undefined") {

                Tasks.removeByProject(id);

            }

            anotar("BAJA", proyecto);

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(projects)
            );

        }

    };

})();
