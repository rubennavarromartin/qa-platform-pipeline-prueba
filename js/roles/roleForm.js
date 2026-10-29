const RoleForm = (() => {

    function permisos(role = {}) {

        const concedidos =
            role.permissions || [];

        return Roles.PERMISOS

            .map(permiso => `
            <label class="check">
                <input
                    id="${permiso.id}"
                    type="checkbox"
                    ${concedidos.includes(permiso.name) ? "checked" : ""}>
                ${permiso.name}
            </label>`)

            .join("");

    }

    function html(role = {}) {

        return `

<h2>
    ${role.id ? "Editar rol" : "Nuevo rol"}
</h2>

<div class="form">

    <ol class="pasos">
        <li>1. El rol</li>
        <li>2. Permisos</li>
    </ol>

    <fieldset class="paso">

        <legend>El rol</legend>

        <label>
            Rol *
            <input
                id="roleName"
                aria-required="true"
                value="${role.name || ""}">
        </label>

        <label>
            Descripción
            <textarea
                id="roleDescription"
                rows="3">${role.description || ""}</textarea>
        </label>

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Permisos</legend>

        <fieldset class="checks">

            <legend>Qué puede hacer</legend>
${permisos(role)}

        </fieldset>

        <label>
            Estado

            <select id="roleStatus">

                <option ${role.status === "Activo" ? "selected" : ""}>
                    Activo
                </option>

                <option ${role.status === "Inactivo" ? "selected" : ""}>
                    Inactivo
                </option>

            </select>

        </label>

    </fieldset>

    <div class="modal-buttons">

        <button
            id="cancelButton"
            class="btn-cancel"
            type="button">

            Cancelar

        </button>

        <button
            id="backButton"
            class="btn-secondary"
            type="button"
            hidden>

            Atrás

        </button>

        <button
            id="nextButton"
            class="btn-primary"
            type="button">

            Siguiente

        </button>

        <button
            id="saveButton"
            type="button"
            hidden>

            Guardar

        </button>

    </div>

</div>

`;

    }

    function save(role = {}) {

        const newRole = {

            id: role.id,

            name: document
                .getElementById("roleName")
                .value
                .trim(),

            description: document
                .getElementById("roleDescription")
                .value
                .trim(),

            permissions: Roles.PERMISOS

                .filter(permiso =>
                    document.getElementById(permiso.id).checked
                )

                .map(permiso => permiso.name),

            status: document
                .getElementById("roleStatus")
                .value

        };

        if (!newRole.name) {

            Toast.error("El nombre del rol es obligatorio.");

            return;

        }

        if (!newRole.permissions.length) {

            Toast.error("Un rol necesita al menos un permiso.");

            return;

        }

        if (role.id) {

            Roles.update(newRole);

        } else {

            Roles.create(newRole);

        }

        CrudPage.pintar();

        Modal.close();

    }

    return {

        open(role = {}) {

            Modal.open(
                html(role)
            );

            Wizard.create();

            document
                .getElementById("cancelButton")
                .onclick = Modal.close;

            document
                .getElementById("saveButton")
                .onclick = () => save(role);

        }

    };

})();
