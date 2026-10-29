/*
|--------------------------------------------------------------------------
| El formulario de un proyecto
|--------------------------------------------------------------------------
|
| Dos cosas que este formulario plantea y ningún otro del laboratorio:
|
| **Los dos desplegables salen de otro sitio.** La empresa, del módulo de
| Empresas; el estado, del catálogo que se administra en Configuración. Nada
| se escribe a mano, así que la relación no se puede romper escribiendo mal un
| nombre — y, sobre todo, **lo que ofrece el desplegable cambia si alguien
| toca Configuración**. Para la plataforma eso es una pantalla cuyas opciones
| dependen de otra pantalla.
|
| **Y el avance es un número con límites.** De 0 a 100, declarados en el
| `input`. Es el primer campo del laboratorio que tiene un rango, y de ahí
| sale un negativo que no se podía plantear: escribir 150.
|
| **Y dos obligatorios que no dicen lo que son**, con la forma de los de
| "Nuevo viaje" de Bitácora, medidos el 21 de octubre de 2026: la fecha de
| inicio en un calendario que no se declara —texto sin papel, y una tabla de
| días que no se dice rejilla— y la ciudad de la obra en un autocompletado que
| se dice `searchbox`, no sugiere hasta que se teclea y cuelga su lista fuera
| del diálogo. Allí, la plataforma los rellenaba con "QA Test 001" y el alta no
| se guardaba nunca: 13 de sus 14 altas. La pregunta es si se reconocen por lo
| que hacen.
|
*/

/*
* Las ciudades que ofrece la de la obra. Una lista fija: lo que se plantea es
* cómo se elige, no de dónde salen.
*/

const CIUDADES_DE_OBRA = [
    "A Coruña", "Albacete", "Alicante", "Badajoz", "Barcelona", "Bilbao",
    "Burgos", "Cádiz", "Granada", "León", "Logroño", "Madrid", "Málaga",
    "Murcia", "Oviedo", "Palma", "Pamplona", "Salamanca", "Santander",
    "Sevilla", "Valencia", "Valladolid", "Vigo", "Zaragoza"
];

const ProjectForm = (() => {

    function empresaOptions(elegida) {

        if (typeof Companies === "undefined") {

            return "";

        }

        return Companies.findAll()

            .map(empresa => `
                <option
                    value="${empresa.id}"
                    ${empresa.id == elegida ? "selected" : ""}>
                    ${empresa.name}
                </option>`)

            .join("");

    }

    function estadoOptions(elegido) {

        if (typeof ProjectStatuses === "undefined") {

            return "";

        }

        return ProjectStatuses.findAll()

            .map(estado => `
                <option
                    value="${estado.id}"
                    ${estado.id == elegido ? "selected" : ""}>
                    ${estado.name}
                </option>`)

            .join("");

    }

    function html(proyecto = {}) {

        return `

<h2>
    ${proyecto.id ? "Editar proyecto" : "Nuevo proyecto"}
</h2>

<div class="form">

    <label>
        Nombre *
        <input
            id="projectName"
            aria-required="true"
            value="${proyecto.name || ""}">
    </label>

    <label>
        Empresa *
        <select id="projectCompany" aria-required="true">
${empresaOptions(proyecto.companyId)}
        </select>
    </label>

    <label>
        Estado *
        <select id="projectStatus" aria-required="true">
${estadoOptions(proyecto.statusId)}
        </select>
    </label>

    <label>
        Propietaria o propietario
        <input
            id="projectOwner"
            value="${proyecto.owner || ""}">
    </label>

    <!--
    La fecha, en el calendario propio de components/calendario.js y no en el
    del navegador: el de PrimeNG que usa SABESP, que se abre como un diálogo y
    escribe la fecha con barras.
    -->
    <label>
        Entrega prevista
        <input
            id="projectDueDate"
            type="text"
            placeholder="dd/mm/aaaa"
            value="${Calendario.aTexto(proyecto.dueDate)}">
    </label>

    <!--
    La fecha de inicio, en el calendario callado: el p-calendar de Bitácora,
    que no dice que lo es. Ver components/calendario.js.
    -->
    <label>
        Fecha de inicio *
        <input
            id="projectStartDate"
            type="text"
            aria-required="true"
            placeholder="dd/mm/aaaa"
            value="${Calendario.aTexto(proyecto.startDate)}">
    </label>

    <!--
    Y la ciudad, en el autocompletado callado: el p-autocomplete de Bitácora.
    Su lista se muda al body al montarlo. Ver components/autocomplete.js.
    -->
    <label>
        Ciudad de la obra *
        <input
            id="projectCity"
            type="text"
            autocomplete="off"
            aria-required="true"
            placeholder="Escribe para buscar..."
            value="${proyecto.city || ""}">
    </label>

    <ul id="projectCityLista" role="listbox" aria-label="Ciudades" hidden></ul>

    <input id="projectCityValor" type="hidden" value="${proyecto.city || ""}">

    <label>
        Avance (%)
        <input
            id="projectAvance"
            type="number"
            min="0"
            max="100"
            value="${proyecto.avance ?? 0}">
    </label>

    <label>
        Personas en el equipo
        <!--
        Un número que no es un input type="number": el p-inputNumber de
        PrimeNG es texto con role="spinbutton", y SABESP tiene siete así en
        el alta de Contratos. Rellenarlo con un texto no es rellenarlo.
        -->
        <input
            id="projectEquipo"
            type="text"
            role="spinbutton"
            inputmode="numeric"
            aria-valuemin="0"
            value="${proyecto.equipo ?? 0}">
    </label>

    <label>
        Descripción
        <textarea id="projectDescription" rows="3">${proyecto.description || ""}</textarea>
    </label>

</div>

<!--
El botón de guardar no dice ninguna de las palabras que la plataforma buscaba
—guardar, aceptar, crear…—, como el "Cadastrar unidade" del alta de Unidades
de SABESP, y va delante del de cancelar. Medido el 16 de octubre de 2026: sin
reconocerlo por su sitio, las pruebas esperaban un botón que no aparecía.
-->
<div class="modal-acciones">

    <button id="saveButton" class="btn-primary">
        Hecho
    </button>

    <button id="cancelButton">
        Cancelar
    </button>

</div>

`;

    }

    return {

        open(proyecto = {}) {

            Modal.open(html(proyecto));

            Calendario.montar("projectDueDate");

            Calendario.montar("projectStartDate", { callado: true });

            Autocomplete.crear({
                campo: "projectCity",
                valores: () => CIUDADES_DE_OBRA,
                callado: true
            });

            document
                .getElementById("cancelButton")
                .onclick = () => Modal.close();

            document
                .getElementById("saveButton")
                .onclick = () => {

                    const nuevo = {

                        id: proyecto.id,

                        name:
                            document.getElementById("projectName").value.trim(),

                        companyId:
                            Number(document.getElementById("projectCompany").value),

                        statusId:
                            Number(document.getElementById("projectStatus").value),

                        owner:
                            document.getElementById("projectOwner").value.trim(),

                        dueDate:
                            Calendario.aIso(document.getElementById("projectDueDate").value),

                        startDate:
                            Calendario.aIso(document.getElementById("projectStartDate").value),

                        /*
                        * Lo elegido, no lo escrito: el campo oculto sólo se
                        * llena eligiendo de la lista.
                        */

                        city:
                            document.getElementById("projectCityValor").value,

                        avance:
                            Number(document.getElementById("projectAvance").value),

                        equipo:
                            Number(document.getElementById("projectEquipo").value),

                        description:
                            document.getElementById("projectDescription").value.trim()

                    };

                    if (!nuevo.name) {

                        Toast.error("El nombre del proyecto es obligatorio.");

                        return;

                    }

                    if (!nuevo.companyId) {

                        Toast.error("Un proyecto tiene que colgar de una empresa.");

                        return;

                    }

                    if (!nuevo.statusId) {

                        Toast.error("El estado es obligatorio.");

                        return;

                    }

                    /*
                    * Una fecha que no se entiende es una fecha que no hay:
                    * "QA Test 001" no tiene barras, y se queda en nada.
                    */

                    if (!nuevo.startDate) {

                        Toast.error("La fecha de inicio es obligatoria.");

                        return;

                    }

                    if (!CIUDADES_DE_OBRA.includes(nuevo.city)) {

                        Toast.error("Elige la ciudad de la obra de la lista.");

                        return;

                    }

                    /*
                    * El rango se declara en el campo y se comprueba aquí
                    * también: el navegador sólo lo exige si el formulario se
                    * envía de verdad, y este no se envía, se lee.
                    */

                    if (nuevo.avance < 0 || nuevo.avance > 100) {

                        Toast.error("El avance va de 0 a 100.");

                        return;

                    }

                    if (proyecto.id) {

                        Projects.update(nuevo);

                    }
                    else {

                        Projects.add(nuevo);

                    }

                    CrudPage.pintar();

                    Modal.close();

                };

        }

    };

})();
