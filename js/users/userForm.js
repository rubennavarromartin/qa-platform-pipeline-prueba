const UserForm = (() => {

    /*
    * Los roles salen del módulo de Roles. Si esa pantalla
    * todavía no se ha cargado en esta página, se cae a la lista
    * de siempre: un usuario sin rol que elegir no sirve de nada.
    */

    const ROLES = [

        "Administrador",
        "Gestor",
        "Consulta"

    ];

    function roles() {

        const activos =
            typeof Roles !== "undefined"
                ? Roles.nombresActivos()
                : [];

        return activos.length
            ? activos
            : ROLES;

    }

    function roleOptions(selected) {

        return roles()

            .map(role => `
            <option ${role === selected ? "selected" : ""}>
                ${role}
            </option>`)

            .join("");

    }

    function html(user = {}) {

        return `

<h2>
    ${user.id ? "Editar usuario" : "Nuevo usuario"}
</h2>

<div class="form">

    <ol class="pasos">
        <li>1. Identidad</li>
        <li>2. Acceso</li>
    </ol>

    <fieldset class="paso">

        <legend>Identidad</legend>

        <label>
            Usuario *
            <input
                id="userName"
                aria-required="true"
                value="${user.name || ""}">
        </label>

        <label>
            Email *
            <input
                id="userEmail"
                aria-required="true"
                type="email"
                value="${user.email || ""}">
        </label>

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Acceso</legend>

        <!--
        | El usuario y la contraseña con los que se entra. Están
        | en el paso de Acceso y no en el de Identidad porque son
        | credenciales, no datos de la persona.
        |
        | La contraseña se guarda en claro, como todo lo demás:
        | esto es un banco de pruebas y lo que se prueba es que
        | la plataforma sepa entrar, no que nadie pueda colarse.
        -->

        <label>
            Usuario de acceso
            <input
                id="userUsername"
                value="${user.username || ""}">
        </label>

        <label>
            Contraseña
            <input
                id="userPassword"
                type="password"
                value="${user.password || ""}">
        </label>

        <label>
            Rol

            <select id="userRole">
${roleOptions(user.role)}
            </select>

        </label>

        <label>
            Estado

            <select id="userStatus">

                <option ${user.status === "Activo" ? "selected" : ""}>
                    Activo
                </option>

                <option ${user.status === "Inactivo" ? "selected" : ""}>
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

    function save(user = {}) {

        const newUser = {

            id: user.id,

            name: document
                .getElementById("userName")
                .value
                .trim(),

            email: document
                .getElementById("userEmail")
                .value
                .trim(),

            username: document
                .getElementById("userUsername")
                .value
                .trim(),

            password: document
                .getElementById("userPassword")
                .value,

            role: document
                .getElementById("userRole")
                .value
                .trim(),

            status: document
                .getElementById("userStatus")
                .value

        };

        if (!newUser.name) {

            Toast.error("El nombre del usuario es obligatorio.");

            return;

        }

        if (!newUser.email) {

            Toast.error("El email es obligatorio.");

            return;

        }

        /*
        * Y que sea un correo. El campo es `type="email"`, pero el botón de
        * guardar es `type="button"` y el navegador no valida nada: hasta el
        * 20 de octubre de 2026 se guardaba "esto-no-es-un-correo". Lo
        * encontró la prueba de romper las reglas de un campo (`REGLA`).
        */

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {

            Toast.error("El email no tiene forma de correo.");

            return;

        }

        if (user.id) {

            Users.update(newUser);

        } else {

            Users.create(newUser);

        }

        CrudPage.pintar();

        Modal.close();

    }

    return {

        open(user = {}) {

            Modal.open(
                html(user)
            );

            Wizard.create();

            document
                .getElementById("cancelButton")
                .onclick = Modal.close;

            document
                .getElementById("saveButton")
                .onclick = () => save(user);

        }

    };

})();
