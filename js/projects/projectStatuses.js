/*
|--------------------------------------------------------------------------
| Los estados de un proyecto
|--------------------------------------------------------------------------
|
| Cuatro de partida —abierto, en curso, cerrado y cancelado— y se administran
| desde Configuración.
|
| Por qué es un CRUD y no una lista escrita en el código
|
|   Porque es lo que plantea el caso que hacía falta: **un catálogo que otra
|   pantalla usa**. El estado de un proyecto no es un texto libre ni un
|   desplegable fijo; sale de aquí, y si alguien añade "en garantía", el
|   formulario de un proyecto lo ofrece sin tocar una línea.
|
|   Para la plataforma eso es una relación entre dos pantallas de las que no
|   tenía ninguna: **Configuración manda sobre Proyectos**. Las que ya había
|   —una empresa y sus contactos— son de datos que se crean todos los días;
|   ésta es de las que se tocan una vez y mandan sobre todo lo demás.
|
| Y los dos que no se pueden borrar
|
|   Un estado que está en uso no se borra: si se borrara, los proyectos que lo
|   tuvieran se quedarían con un estado que no existe. Se dice y no se hace,
|   que es lo que hace cualquier aplicación seria — y de paso es un negativo
|   que se puede probar.
|
*/

const ProjectStatuses = (() => {

    const STORAGE_KEY = "qa-platform-project-statuses";

    /*
    * El orden importa y es el del ciclo de vida: un proyecto se abre, se
    * trabaja, y acaba cerrado o cancelado. El kanban de proyectos, si algún
    * día lo hay, pintaría sus columnas en este orden.
    */

    const statuses = [

        {
            id: 1,
            name: "Abierto",
            description: "Dado de alta y todavía sin empezar.",
            orden: 1,
            final: "No"
        },

        {
            id: 2,
            name: "En curso",
            description: "Se está trabajando en él.",
            orden: 2,
            final: "No"
        },

        {
            id: 3,
            name: "Cerrado",
            description: "Terminado y entregado.",
            orden: 3,
            final: "Sí"
        },

        {
            id: 4,
            name: "Cancelado",
            description: "No se va a terminar.",
            orden: 4,
            final: "Sí"
        }

    ];

    function anotar(accion, estado) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Estado de proyecto",

            accion: Log.ACCIONES[accion],

            registro: estado?.name,

            id: estado?.id

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

            statuses.length = 0;

            statuses.push(...JSON.parse(data));

        },

        findAll() {

            return [...statuses].sort((a, b) => a.orden - b.orden);

        },

        findById(id) {

            return statuses.find(estado => estado.id == id) || null;

        },

        findByName(name) {

            const buscado =
                String(name || "").toLowerCase();

            return statuses.find(
                estado => estado.name.toLowerCase() === buscado
            ) || null;

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            const buscado =
                text.toLowerCase();

            return this.findAll().filter(estado =>
                estado.name.toLowerCase().includes(buscado) ||
                (estado.description || "").toLowerCase().includes(buscado)
            );

        },

        add(estado) {

            const nuevo = {

                ...estado,

                id:
                    statuses.length
                        ? Math.max(...statuses.map(uno => uno.id)) + 1
                        : 1

            };

            statuses.push(nuevo);

            this.save();

            anotar("ALTA", nuevo);

            return nuevo;

        },

        update(estado) {

            const donde =
                statuses.findIndex(uno => uno.id === estado.id);

            if (donde >= 0) {

                statuses[donde] = estado;

                this.save();

                anotar("EDICION", estado);

            }

        },

        /*
        * Cuántos proyectos lo están usando.
        *
        * Se pregunta al repositorio de proyectos si está cargado. En la
        * pantalla de Configuración lo está; suelta, no, y entonces se
        * contesta cero — que es lo mismo que hace el resto del laboratorio
        * cuando una pantalla se abre sin sus vecinas.
        */

        enUso(id) {

            if (typeof Projects === "undefined") {

                return 0;

            }

            return Projects.findAll().filter(
                proyecto => proyecto.statusId == id
            ).length;

        },

        remove(id) {

            const estado =
                this.findById(id);

            if (!estado) {

                return { borrado: false, motivo: "no existe" };

            }

            const usos =
                this.enUso(id);

            if (usos) {

                return {

                    borrado: false,

                    motivo:
                        `lo usan ${usos} ${usos === 1 ? "proyecto" : "proyectos"}`

                };

            }

            statuses.splice(
                statuses.findIndex(uno => uno.id == id),
                1
            );

            this.save();

            anotar("BAJA", estado);

            return { borrado: true };

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(statuses)
            );

        }

    };

})();
