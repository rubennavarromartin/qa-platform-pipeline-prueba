/*
|--------------------------------------------------------------------------
| Gastos
|--------------------------------------------------------------------------
|
| Los gastos que sube un comercial: una comida con un cliente, un
| taxi, un hotel.
|
| Existe por una sola razón, y está contada entera en `gastos.html`:
| **su botón de alta se llama "Subir gasto"**, que no empieza por
| ninguna de las seis palabras con las que la plataforma reconocía
| la acción de un botón. Es el caso de Bitácora traído a donde se
| puede medir.
|
| Lo demás es lo mínimo para que la pantalla sea una pantalla de
| verdad: una rejilla, un buscador y un alta. Sin edición ni
| borrado a propósito — lo que se pregunta aquí es si el alta se
| reconoce, y añadirle más botones sin nombre reconocible metería
| más preguntas en el mismo sitio.
|
*/

const Gastos = (() => {

    const STORAGE_KEY = "qa-platform-gastos";

    /*
    * De partida, cuatro. Con los tres estados representados, por lo
    * mismo que en Aprobaciones: una tabla donde todo dice lo mismo
    * no enseña que la columna signifique algo.
    */

    const gastos = [

        {
            id: 1,
            concepto: "Comida con Industrias Álvarez",
            fecha: "2026-09-14",
            importe: 62.40,
            estado: "Pendiente"
        },

        {
            id: 2,
            concepto: "Taxi al aeropuerto",
            fecha: "2026-09-16",
            importe: 38.00,
            estado: "Aprobado"
        },

        {
            id: 3,
            concepto: "Hotel en Valencia, dos noches",
            fecha: "2026-09-21",
            importe: 184.50,
            estado: "Aprobado"
        },

        {
            id: 4,
            concepto: "Parking del centro",
            fecha: "2026-09-25",
            importe: 12.00,
            estado: "Rechazado"
        }

    ];

    const DE_PARTIDA =
        gastos.map(uno => ({ ...uno }));

    return {

        load() {

            const guardado =
                localStorage.getItem(STORAGE_KEY);

            if (!guardado) {

                this.save();

                return;

            }

            gastos.length = 0;

            gastos.push(...JSON.parse(guardado));

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(gastos)
            );

        },

        findAll() {

            return [...gastos];

        },

        /*
        * Lo que pasa la búsqueda es el concepto. El importe no: es
        * un número, y buscar "12" traería también el 120.
        */

        search(texto) {

            const busca =
                String(texto || "").trim().toLowerCase();

            if (!busca) {

                return this.findAll();

            }

            return gastos.filter(uno =>
                String(uno.concepto).toLowerCase().includes(busca)
            );

        },

        create(datos) {

            const gasto = {

                id:
                    gastos.reduce((alto, uno) => Math.max(alto, uno.id), 0) + 1,

                concepto:
                    String(datos.concepto || "").trim(),

                fecha:
                    datos.fecha || new Date().toISOString().slice(0, 10),

                importe:
                    Number(datos.importe) || 0,

                /*
                * Nace pendiente siempre. Quien lo sube no decide si
                * se le paga, que es justo lo que hace realista este
                * formulario: tiene campos que se rellenan y uno que
                * no se elige.
                */

                estado:
                    "Pendiente"

            };

            gastos.push(gasto);

            this.save();

            if (window.ActivityLog) {

                ActivityLog.anotar({
                    entidad:  "Gasto",
                    accion:   ActivityLog.ACCIONES.ALTA,
                    registro: gasto.concepto,
                    id:       gasto.id
                });

            }

            return gasto;

        },

        reset() {

            gastos.length = 0;

            gastos.push(...DE_PARTIDA.map(uno => ({ ...uno })));

            this.save();

        }

    };

})();
