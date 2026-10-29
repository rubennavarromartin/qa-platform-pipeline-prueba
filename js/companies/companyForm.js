const CompanyForm = (() => {

    /*
    * La provincia de una empresa. No se guarda: se deduce de su
    * municipio, que es lo que la tabla enseña. Una empresa nueva
    * empieza en la primera provincia.
    */

    function provinciaDe(company) {

        return Provinces.provinciaDe(company.city)
            || Provinces.nombres()[0];

    }

    function opciones(valores, selected) {

        return valores

            .map(valor => `
                <option ${valor === selected ? "selected" : ""}>
                    ${valor}
                </option>`)

            .join("");

    }

    /*
    * El municipio depende de la provincia: al cambiar una, la
    * otra se rehace. Es el caso clásico de dos campos
    * encadenados, y por eso está en el laboratorio.
    */

    function encadenar() {

        const provincia =
            document.getElementById("companyProvince");

        const municipio =
            document.getElementById("companyCity");

        if (!provincia || !municipio) {

            return;

        }

        provincia.addEventListener("change", () => {

            municipio.innerHTML =
                opciones(
                    Provinces.municipiosDe(provincia.value),
                    null
                );

        });

    }

    /*
    * El asterisco y el `aria-required` de los campos obligatorios.
    *
    * `save` los exigía desde el principio —sin nombre y sin CIF no
    * se guarda— y la pantalla no lo decía en ninguna parte: quien
    * rellenaba el formulario se enteraba al intentar guardarlo.
    *
    * Ahora lo dice de las dos maneras en las que se puede decir: el
    * asterisco, que lo ve una persona, y el atributo, que lo lee un
    * lector de pantalla. Y de paso queda dicho para quien mire la
    * pantalla desde fuera, que es la pregunta que el laboratorio
    * vino a plantear: un formulario que exige campos sin declarar
    * cuáles no se puede probar sin rellenarlo.
    */

    function html(company = {}) {

        return `

<h2>
    ${company.id ? "Editar empresa" : "Nueva empresa"}
</h2>

<div class="form">

    <ol class="pasos">
        <li>1. Identificación</li>
        <li>2. Ubicación</li>
    </ol>

    <fieldset class="paso">

        <legend>Identificación</legend>

        <label>
            Empresa *
            <input
                id="companyName"
                aria-required="true"
                value="${company.name || ""}">
        </label>

        <label>
            CIF *
            <input
                id="companyTaxId"
                aria-required="true"
                value="${company.taxId || ""}">
        </label>

        <label>
            Sitio web
            <input
                id="companyWebsite"
                type="url"
                value="${company.website || ""}">
        </label>

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Ubicación</legend>

        <label>
            Provincia

            <select id="companyProvince">
${opciones(Provinces.nombres(), provinciaDe(company))}
            </select>

        </label>

        <label>
            Municipio

            <select id="companyCity">
${opciones(Provinces.municipiosDe(provinciaDe(company)), company.city)}
            </select>

        </label>

        <label>
            Estado

            <select id="companyStatus">

                <option ${company.status === "Activo" ? "selected" : ""}>
                    Activo
                </option>

                <option ${company.status === "Inactivo" ? "selected" : ""}>
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

    function save(company = {}) {

        const newCompany = {

            id: company.id,

            name: document
                .getElementById("companyName")
                .value
                .trim(),

            taxId: document
                .getElementById("companyTaxId")
                .value
                .trim(),

            /*
            * Sólo en `crm_dev`, a propósito: es lo que tiene el entorno de
            * desarrollo y todavía no ha llegado a `pre` ni a `pro`, la
            * funcionalidad nueva del piloto de la Idea 19. Con ella se ve si
            * la plataforma asocia lo que coincide entre entornos y deja suelto
            * lo que no, y qué pasa al promocionar una prueba suya a un entorno
            * que no lo tiene. Se "despliega" copiando la carpeta.
            */

            website: document
                .getElementById("companyWebsite")
                .value
                .trim(),

            city: document
                .getElementById("companyCity")
                .value
                .trim(),

            status: document
                .getElementById("companyStatus")
                .value

        };

        if (!newCompany.name) {

            Toast.error("El nombre de la empresa es obligatorio.");

            return;

        }

        if (!newCompany.taxId) {

            Toast.error("El CIF es obligatorio.");

            return;

        }

        /*
        * Y el CIF no se puede repetir.
        *
        * Faltaba, y lo destapó la propia plataforma el 14 de septiembre de
        * 2026, el primer día que supo preguntarlo: se le dijo en la cola de
        * revisión que el CIF de Empresas no se repite, y la prueba que sale de
        * ahí creó dos empresas con el mismo y las dos se guardaron.
        *
        * Un CRM que admite dos empresas con el mismo CIF no es un banco de
        * pruebas realista: es la clase de fallo que se descubre tres meses
        * después con dos fichas del mismo cliente y los presupuestos
        * repartidos entre las dos.
        *
        * Se compara sin mayúsculas ni espacios, que es como lo compararía
        * cualquiera: "b12345678" y "B12345678 " son el mismo CIF.
        */

        const comoSeCompara =
            cif => String(cif || "").trim().toUpperCase();

        const yaExiste =
            Companies.findAll().some(otra =>

                otra.id !== newCompany.id &&
                comoSeCompara(otra.taxId) === comoSeCompara(newCompany.taxId)

            );

        if (yaExiste) {

            Toast.error("Ya hay una empresa con ese CIF.");

            return;

        }

        if (company.id) {

            Companies.update(newCompany);

        } else {

            Companies.create(newCompany);

        }

        CrudPage.pintar();

        Modal.close();

    }

    return {

        open(company = {}) {

            Modal.open(
                html(company)
            );

            Wizard.create();

            encadenar();

            document
                .getElementById("cancelButton")
                .onclick = Modal.close;

            document
                .getElementById("saveButton")
                .onclick = () => save(company);

        }

    };

})();
