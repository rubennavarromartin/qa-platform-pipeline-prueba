/*
|--------------------------------------------------------------------------
| Usuarios: los controles de fila no dicen cómo se llaman
|--------------------------------------------------------------------------
|
| Montado el 7 de septiembre de 2026, y la pregunta que le plantea a la
| plataforma es ésta: **¿sabes qué hace un botón que no tiene nombre?**
|
| Las otras cinco rejillas del laboratorio ponen "🗑 Eliminar" en su botón
| de fila, así que se clasifica leyéndolo. Una aplicación de verdad no
| siempre lo hace: los botones de fila de Bitácora son iconos sin texto y
| sin nombre accesible, y con ellos la plataforma no sabía cuál edita y cuál
| borra — de sus 39 pantallas con rejilla, ninguna tenía prueba de editar ni
| de borrar, y por eso se quedaban sin cubrir 57 de sus 121 casos negativos.
|
| Aquí están los dos, y a propósito los dos: el lápiz abre un formulario con
| los datos de la fila y la papelera una confirmación sin campos. Eso —lo
| que aparece al pulsar— es lo único que los distingue cuando no se les
| puede leer el nombre.
|
| Por qué aquí y no en Roles, que fue el primer intento
|
|   Porque el borrado de un rol está bloqueado: todos los roles del
|   laboratorio tienen usuarios, así que la aplicación se niega y avisa con
|   un mensaje en lugar de abrir la confirmación. Al pulsar no aparecía nada,
|   y el reconocimiento contestaba —con razón— que no sabía qué hacía. **Una
|   pantalla donde la acción no se puede ejercer no plantea la pregunta que
|   dice plantear**, que es la misma lección que dejó el mockup con sus dos
|   tablas.
|
| Por qué el icono va con `aria-hidden` y el botón sin `aria-label`
|
|   Porque así es como aparece el caso de verdad. Un botón así **incumple la
|   WCAG en su criterio 4.1.2**: quien no ve el dibujo no sabe qué botón es.
|   El laboratorio lo monta porque existe, no porque esté bien — igual que
|   las cinco rejillas que no dejan colocar sin arrastrar.
|
| Las clases se quedan, y no es trampa
|
|   `btn-edit` y `btn-delete` siguen puestas porque las usa **la propia
|   aplicación**: es como esconde los botones que un rol no puede usar. No le
|   dan ninguna pista a la plataforma, que clasifica por el texto y por lo
|   que pasa al pulsar, y nunca por el nombre de una clase. Ya se aprendió
|   aquí que `data-id` no es un identificador sino un atributo cualquiera;
|   una clase es lo mismo.
|
*/

const UserUI = (() => {

    /*
    * El lápiz y la papelera, sin una palabra. `aria-hidden` en el dibujo y
    * ningún `aria-label` en el botón: el nombre accesible queda vacío, que
    * es el caso que se quiere plantear.
    */

    function icono(camino) {

        return `
            <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-hidden="true"
                focusable="false">
                <path d="${camino}" fill="currentColor"></path>
            </svg>
        `;

    }

    const LAPIZ =
        "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 " +
        "7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 " +
        "3.75 3.75 1.83-1.83z";

    const PAPELERA =
        "M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 " +
        "1H5v2h14V4z";

    function renderRow(user) {

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(user.id)}

    <td>
        <a
            class="ficha"
            href="users.html?id=${user.id}">
            ${user.name}
        </a>
    </td>

    <td>${user.email}</td>

    <td>${user.role}</td>

    <td>${Badge.status(user.status)}</td>

    <td>

        <div class="action-buttons">


            <button
                class="btn-edit"
                data-id="${user.id}">
                ${icono(LAPIZ)}
            </button>

            <button
                class="btn-delete"
                data-id="${user.id}">
                ${icono(PAPELERA)}
            </button>

        </div>

    </td>

</tr>

`;

    }

    /*
    * Dentro de esta tabla, no en toda la página: la pantalla
    * tiene también la tabla de documentos.
    */

    function bindEvents() {

        /*
        * El lápiz abre el formulario con los datos del usuario. Es lo que la
        * plataforma tiene que poder deducir pulsándolo: un diálogo con
        * campos es una edición.
        */

        document
            .querySelectorAll("#usersGrid .btn-edit")
            .forEach(button => {

                button.onclick = () => {

                    const user =
                        Users.findById(Number(button.dataset.id));

                    if (!user) {

                        return;

                    }

                    if (!Permissions.exigir(Permissions.EDITAR)) {

                        return;

                    }

                    UserForm.open(user);

                };

            });

        document
            .querySelectorAll("#usersGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const user =
                        Users.findById(id);

                    if (!user) {

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar el usuario "${user.name}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }
                    Users.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    return {

        renderTable(users) {

            DataTable.render(
                "#usersGrid tbody",
                users.map(renderRow)
            );

            bindEvents();

        }

    };

})();
