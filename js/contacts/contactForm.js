const ContactForm = (() => {

    /*
    * Un contacto pertenece a una empresa, y las empresas las
    * tiene su módulo. Se elige de una lista en lugar de
    * escribirse: escrita a mano, "Bosonit" y "bosonit " son dos
    * empresas distintas y la relación se rompe sola.
    */

    function empresaOptions(selected) {

        return Companies.nombres()

            .map(nombre => `
                <option ${nombre === selected ? "selected" : ""}>
                    ${nombre}
                </option>`)

            .join("");

    }

    /*
    * El correo es `type="email"` y el teléfono pide al menos nueve
    * caracteres (`minlength`). Son reglas que el campo **declara**, y la
    * pregunta del laboratorio, desde el 20 de octubre de 2026, es si la
    * plataforma prueba que se **cumplan**: que un alta con un correo que no
    * lo es, o con un teléfono de cuatro cifras, no se guarde.
    *
    * El correo se declaraba desde el principio y no se comprobaba en
    * ninguna parte: el botón de guardar es `type="button"`, así que el
    * navegador no valida nada y guardaba "esto-no-es-un-correo" sin
    * rechistar. Es lo que tiene que encontrar la prueba.
    */

    function html(contact = {}) {

        return `

<h2>
    ${contact.id ? "Editar contacto" : "Nuevo contacto"}
</h2>

<div class="form">

    <ol class="pasos">
        <li>1. Quién es</li>
        <li>2. Cómo contactar</li>
    </ol>

    <fieldset class="paso">

        <legend>Quién es</legend>

        <label>
            Nombre *
            <input
                id="contactName"
                aria-required="true"
                value="${contact.name || ""}">
        </label>

        <label>
            Empresa

            <select id="contactCompany">
${empresaOptions(contact.company)}
            </select>

        </label>

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Cómo contactar</legend>

        <label>
            Email
            <input
                id="contactEmail"
                type="email"
                value="${contact.email || ""}">
        </label>

        <label>
            Teléfono
            <input
                id="contactPhone"
                minlength="9"
                value="${contact.phone || ""}">
        </label>

        <label>
            Estado
            <select id="contactStatus">
                <option ${contact.status === "Activo" ? "selected" : ""}>
                    Activo
                </option>
                <option ${contact.status === "Inactivo" ? "selected" : ""}>
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

    return {

        open(contact = {}) {

            Modal.open(
                html(contact)
            );

            Wizard.create();

            document
                .getElementById("cancelButton")
                .onclick = () => {

                    Modal.close();

                };

            document
                .getElementById("saveButton")
                .onclick = () => {

                    const newContact = {

                        id: contact.id,

                        name: document
                            .getElementById("contactName")
                            .value
                            .trim(),

                        company: document
                            .getElementById("contactCompany")
                            .value
                            .trim(),

                        email: document
                            .getElementById("contactEmail")
                            .value
                            .trim(),

                        phone: document
                            .getElementById("contactPhone")
                            .value
                            .trim(),

                        status: document
                            .getElementById("contactStatus")
                            .value

                    };

                    if (!newContact.name) {

                        Toast.error("El nombre es obligatorio.");

                        return;

                    }

                    /*
                    * Y lo que declaran el correo y el teléfono, cuando se
                    * rellenan: ninguno de los dos es obligatorio. El porqué,
                    * arriba en `html`.
                    */

                    if (newContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {

                        Toast.error("El email no tiene forma de correo.");

                        return;

                    }

                    if (newContact.phone && newContact.phone.length < 9) {

                        Toast.error("El teléfono tiene al menos nueve cifras.");

                        return;

                    }

                    if (contact.id) {

                        Contacts.update(newContact);

                    } else {

                        Contacts.create(newContact);

                    }

                    CrudPage.pintar();

                    Modal.close();

                };

        }

    };

})();
