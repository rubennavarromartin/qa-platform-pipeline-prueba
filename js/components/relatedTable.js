/*
|--------------------------------------------------------------------------
| RelatedTable
|--------------------------------------------------------------------------
|
| La tabla de registros relacionados que cuelga de una ficha: los
| contactos de una empresa, las citas de un contacto, los
| usuarios de un rol.
|
| Siempre es lo mismo —un título, una tabla y un aviso cuando no
| hay nada— así que es un solo componente para las tres. Las
| tablas vacías sin explicación parecen un error.
|
| No se da de alta desde aquí: el formulario ya existe en el
| módulo del registro relacionado, y duplicarlo sólo añadiría una
| copia que mantener.
|
*/

const RelatedTable = (() => {

    function celda(valor) {

        return `<td>${valor ?? ""}</td>`;

    }

    return {

        /*
        * nombre       el de la pestaña: "Contactos", "Citas"...
        * titulo       encabezado del panel
        * columnas     los nombres de las columnas
        * registros    lo que hay que pintar
        * fila         (registro) -> los valores de sus celdas
        * vacio        qué decir cuando no hay ninguno
        */

        render({ nombre, titulo, columnas, registros, fila, vacio }) {

            const encabezado =
                document.getElementById(`ficha${nombre}Titulo`);

            const aviso =
                document.getElementById(`ficha${nombre}Vacio`);

            const tabla =
                document.getElementById(`ficha${nombre}Grid`);

            const cabecera =
                document.getElementById(`ficha${nombre}Cabecera`);

            if (!tabla) {

                return;

            }

            encabezado.textContent = titulo;

            cabecera.innerHTML =
                columnas.map(c => `<th>${c}</th>`).join("");

            DataTable.render(

                `#ficha${nombre}Grid tbody`,

                registros.map(registro =>
                    `<tr>${fila(registro).map(celda).join("")}</tr>`
                )

            );

            aviso.textContent = vacio;

            aviso.hidden = registros.length > 0;

            tabla.hidden = registros.length === 0;

        }

    };

})();
