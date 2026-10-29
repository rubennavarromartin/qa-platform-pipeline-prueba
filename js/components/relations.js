/*
|--------------------------------------------------------------------------
| Relations
|--------------------------------------------------------------------------
|
| Qué cuelga de un registro, para no borrarlo por debajo.
|
| Borrar una empresa que tiene contactos y citas deja contactos
| sin empresa y citas sin cliente. Aquí se pregunta qué depende
| del registro, y si depende algo no se borra: se dice qué es y
| cuánto hay.
|
| Cada módulo declara sus dependencias. Se hace así, y no con una
| lista central, porque quien sabe que una cita tiene un contacto
| es el módulo de la Agenda.
|
| El aviso dice qué hay que hacer antes, no sólo que no se puede:
| "tiene 2 contactos" se entiende; "no se puede borrar" obliga a
| adivinar.
|
*/

const Relations = (() => {

    return {

        /*
        * dependencias: [{ nombre, cuantos }]
        *
        *   nombre    cómo se llama lo que cuelga: "contactos"
        *   cuantos   cuántos hay
        *
        * Devuelve las que tienen algo.
        */

        de(dependencias = []) {

            return dependencias.filter(d => d.cuantos > 0);

        },

        /*
        * El aviso, con las dependencias enumeradas.
        */

        aviso(nombre, dependencias) {

            const partes =
                dependencias.map(d =>
                    `${d.cuantos} ${d.cuantos === 1 ? d.singular : d.nombre}`
                );

            const lista =
                partes.length < 2
                    ? partes[0]
                    : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;

            return `No se puede eliminar "${nombre}": tiene ${lista}. ` +
                "Hay que quitar esas relaciones antes.";

        }

    };

})();
