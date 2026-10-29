/*
|--------------------------------------------------------------------------
| Las tareas de un proyecto
|--------------------------------------------------------------------------
|
| Lo que hay que hacer en un proyecto, repartido en tres columnas —pendiente,
| en curso y completada— que se ven como un tablero dentro de su ficha.
|
| Por qué sus estados no salen de Configuración
|
|   Los del proyecto sí, porque son un catálogo que alguien administra. Los de
|   una tarea son las columnas del tablero, y un tablero con columnas que se
|   dan de alta es otro caso —bueno, pero otro—. Aquí son tres y son fijas.
|
|   Y conviene que sean **distintos de los del proyecto** a propósito: en la
|   misma pantalla hay un "En curso" que es el estado del proyecto y otro que
|   es una columna de tareas. Quien lea la pantalla por el texto los
|   confundirá, que es exactamente lo que este laboratorio quiere plantear.
|
*/

const Tasks = (() => {

    const STORAGE_KEY = "qa-platform-tasks";

    /*
    * Las columnas del tablero, en su orden. Se exporta para que la ficha no
    * las escriba otra vez: dos listas iguales en dos sitios acaban siendo
    * dos listas distintas.
    */

    const COLUMNAS = ["Pendiente", "En curso", "Completada"];

    const tasks = [

        {
            id: 1,
            projectId: 1,
            title: "Validar flujo de registro",
            estado: "Pendiente",
            fecha: "2026-09-18",
            area: "Diseño",
            quien: "AP"
        },

        {
            id: 2,
            projectId: 1,
            title: "Preparar guía de bienvenida",
            estado: "Pendiente",
            fecha: "2026-09-20",
            area: "Contenido",
            quien: "MR"
        },

        {
            id: 3,
            projectId: 1,
            title: "Integrar panel de facturas",
            estado: "En curso",
            fecha: "2026-09-16",
            area: "Desarrollo",
            quien: "JL"
        },

        {
            id: 4,
            projectId: 1,
            title: "Revisión de accesibilidad",
            estado: "En curso",
            fecha: "2026-09-19",
            area: "QA",
            quien: "SG"
        },

        {
            id: 5,
            projectId: 1,
            title: "Mapa del nuevo sitio",
            estado: "Completada",
            fecha: "2026-09-15",
            area: "UX",
            quien: "AP"
        },

        {
            id: 6,
            projectId: 3,
            title: "Modo sin cobertura",
            estado: "En curso",
            fecha: "2026-09-22",
            area: "Desarrollo",
            quien: "JL"
        },

        {
            id: 7,
            projectId: 3,
            title: "Firma del parte en el móvil",
            estado: "Pendiente",
            fecha: "2026-09-25",
            area: "Diseño",
            quien: "MR"
        },

        {
            id: 8,
            projectId: 6,
            title: "Conciliar movimientos de prueba",
            estado: "Completada",
            fecha: "2026-09-10",
            area: "Desarrollo",
            quien: "SG"
        }

    ];

    function anotar(accion, tarea) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Tarea",

            accion: Log.ACCIONES[accion],

            registro: tarea?.title,

            id: tarea?.id

        });

    }

    return {

        COLUMNAS,

        load() {

            const data =
                localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            tasks.length = 0;

            tasks.push(...JSON.parse(data));

        },

        findAll() {

            return [...tasks];

        },

        findById(id) {

            return tasks.find(tarea => tarea.id == id) || null;

        },

        findByProject(projectId) {

            return tasks.filter(tarea => tarea.projectId == projectId);

        },

        /*
        * Las de una columna de un proyecto, que es como las pide el tablero.
        */

        findByColumna(projectId, estado) {

            return this.findByProject(projectId).filter(
                tarea => tarea.estado === estado
            );

        },

        add(tarea) {

            const nueva = {

                ...tarea,

                id:
                    tasks.length
                        ? Math.max(...tasks.map(uno => uno.id)) + 1
                        : 1

            };

            tasks.push(nueva);

            this.save();

            anotar("ALTA", nueva);

            return nueva;

        },

        update(tarea) {

            const donde =
                tasks.findIndex(uno => uno.id === tarea.id);

            if (donde >= 0) {

                tasks[donde] = tarea;

                this.save();

                anotar("EDICION", tarea);

            }

        },

        /*
        * Moverla a la columna de al lado.
        *
        * Devuelve si se ha movido: en la primera columna no hay anterior y en
        * la última no hay siguiente, y quien llama necesita saberlo para no
        * decir que ha pasado algo que no ha pasado.
        */

        mover(id, haciaDonde) {

            const tarea =
                this.findById(id);

            if (!tarea) {

                return false;

            }

            const donde =
                COLUMNAS.indexOf(tarea.estado);

            const destino =
                donde + (haciaDonde === "siguiente" ? 1 : -1);

            if (destino < 0 || destino >= COLUMNAS.length) {

                return false;

            }

            const antes =
                tarea.estado;

            tarea.estado = COLUMNAS[destino];

            this.save();

            if (typeof Log !== "undefined") {

                Log.anotar({

                    entidad: "Tarea",

                    accion: Log.ACCIONES.EDICION,

                    registro: tarea.title,

                    id: tarea.id,

                    detalle: `de "${antes}" a "${tarea.estado}"`

                });

            }

            return true;

        },

        remove(id) {

            const donde =
                tasks.findIndex(uno => uno.id == id);

            if (donde < 0) {

                return;

            }

            const tarea =
                tasks[donde];

            tasks.splice(donde, 1);

            this.save();

            anotar("BAJA", tarea);

        },

        removeByProject(projectId) {

            for (let i = tasks.length - 1; i >= 0; i--) {

                if (tasks[i].projectId == projectId) {

                    tasks.splice(i, 1);

                }

            }

            this.save();

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(tasks)
            );

        }

    };

})();
