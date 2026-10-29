const RoleUI = (() => {

    function renderRow(role) {

        const permisos =
            (role.permissions || []).length
                ? role.permissions.join(", ")
                : "—";

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(role.id)}

    <td>
        <a
            class="ficha"
            href="roles.html?id=${role.id}">
            ${role.name}
        </a>
    </td>

    <td>${role.description || ""}</td>

    <td>${permisos}</td>

    <td>${Badge.status(role.status)}</td>

    <td>

        <div class="action-buttons">


            <button
                class="btn-delete"
                data-id="${role.id}">
                🗑 Eliminar
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

        document
            .querySelectorAll("#rolesGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const role =
                        Roles.findById(id);

                    if (!role) {

                        return;

                    }

                    const dependencias =
                        CrudPage.dependencias(role);

                    if (dependencias.length) {

                        Toast.error(Relations.aviso(role.name, dependencias)
                        );

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar el rol "${role.name}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }
                    Roles.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    return {

        renderTable(roles) {

            DataTable.render(
                "#rolesGrid tbody",
                roles.map(renderRow)
            );

            bindEvents();

        }

    };

})();
