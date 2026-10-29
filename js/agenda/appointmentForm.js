const AppointmentForm = (() => {

    function options(valores, selected) {

        return valores

            .map(valor => `
            <option ${valor === selected ? "selected" : ""}>
                ${valor}
            </option>`)

            .join("");

    }

    /*
    * La hora, en dos desplegables.
    *
    * Era un `<input type="time">`, que en el fondo es el reloj
    * del navegador: los minutos que ofrece no los decide la
    * aplicación. Y aquí los decide la sociedad, en Configuración:
    * todos, de cuarto en cuarto o de media en media.
    *
    * Si la hora no es obligatoria, los dos desplegables llevan
    * delante una opción vacía: una cita por concretar tiene día
    * pero no hora.
    */

    function partes(hora) {

        const [h = "", m = ""] =
            String(hora || "").split(":");

        return { h, m };

    }

    /*
    * Lo que ofrece cada desplegable, contando con lo que ya
    * tuviera la cita.
    *
    * Una cita guardada antes de estrechar el horario puede estar
    * a una hora que ya no se ofrece, y lo mismo con los minutos
    * si se cambia el intervalo. Se añade lo que tenga a la lista
    * en lugar de dejar que el desplegable elija otra cosa por su
    * cuenta: cambiar en silencio la hora de una cita al abrirla
    * para mirar otro campo es peor que enseñarla como está y
    * decir al guardar que no vale.
    */

    function conLoQueTenia(valores, valor) {

        return valor && !valores.includes(valor)
            ? [...valores, valor].sort()
            : valores;

    }

    function horaHtml(appointment) {

        const { h, m } =
            partes(appointment.time);

        const obligatoria =
            Settings.horaObligatoria();

        const vacia =
            obligatoria
                ? ""
                : `<option value="" ${h ? "" : "selected"}>--</option>`;

        return `
        <label for="appointmentHour">
            Hora${obligatoria ? "" : " (opcional)"}
        </label>

        <div class="hora">

            <select id="appointmentHour">
                ${vacia}
${options(conLoQueTenia(Settings.horas(), h), h)}
            </select>

            <span class="horaSeparador" aria-hidden="true">:</span>

            <!--
            | La etiqueta de los minutos no se ve, pero está: el
            | campo tiene que llamarse de alguna manera para quien
            | no vea que está al lado de la hora. Sin ella, lo que
            | se lee del formulario es "appointmentMinute".
            -->

            <label class="soloLectores" for="appointmentMinute">
                Minutos
            </label>

            <select id="appointmentMinute">
                ${vacia}
${options(conLoQueTenia(Settings.minutos(), m), m)}
            </select>

        </div>`;

    }

    /*
    * Los presupuestos que se pueden elegir: los de la empresa de
    * la cita. La opción vacía va primera y se llama "Ninguno",
    * que se entiende; una opción en blanco parece un error de la
    * aplicación.
    */

    function quoteOptions(empresa, elegido) {

        const codigos =
            Appointments.presupuestosDe(empresa);

        return `
                <option value="" ${elegido ? "" : "selected"}>
                    Ninguno
                </option>
${options(codigos, elegido)}`;

    }

    /*
    * Con qué empresa está la cita.
    *
    * Una cita nueva no trae ninguna, pero el desplegable no tiene
    * opción en blanco: enseña la primera de la lista y ésa es la
    * que hay que tener en cuenta para ofrecer contactos y
    * presupuestos. Sin esto, una cita nueva ofrecía los catorce
    * presupuestos del CRM mientras el desplegable decía
    * "Bosonit".
    */

    function empresaDe(appointment) {

        return appointment.company || Appointments.empresas()[0] || "";

    }

    function html(appointment = {}) {

        const empresa =
            empresaDe(appointment);

        return `

<h2>
    ${appointment.id ? "Editar cita" : "Nueva cita"}
</h2>

<div class="form">

    <ol class="pasos">
        <li>1. Cuándo</li>
        <li>2. Con quién</li>
    </ol>

    <fieldset class="paso">

        <legend>Cuándo</legend>

        <label>
            Asunto *
            <input
                id="appointmentSubject"
                aria-required="true"
                value="${appointment.subject || ""}">
        </label>

        <label>
            Fecha *
            <input
                id="appointmentDate"
                aria-required="true"
                type="date"
                value="${appointment.date || ""}">
        </label>

${horaHtml(appointment)}

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Con quién</legend>

        <label>
            Empresa

            <select id="appointmentCompany">
${options(Appointments.empresas(), empresa)}
            </select>

        </label>

        <label for="appointmentContact">
            Contacto
        </label>

        <div class="autocompletar">

            <input
                id="appointmentContact"
                type="text"
                role="combobox"
                autocomplete="off"
                aria-autocomplete="list"
                aria-expanded="false"
                aria-controls="appointmentContactLista"
                placeholder="Escribe para buscar..."
                value="${appointment.contact || ""}">

            <ul
                id="appointmentContactLista"
                role="listbox"
                aria-label="Contactos"
                hidden>
            </ul>

            <input
                id="appointmentContactValor"
                type="hidden"
                value="${appointment.contact || ""}">

        </div>

        <!--
            El presupuesto es opcional: la mayoría de las citas no
            son de ninguno. La opción vacía va primera y se llama
            "Ninguno", que se entiende; una opción en blanco parece
            un error de la aplicación.
        -->

        <label>
            Presupuesto

            <select id="appointmentQuote">
${quoteOptions(empresa, appointment.quote)}
            </select>

        </label>

        <label>
            Estado

            <select id="appointmentStatus">
${options(Appointments.ESTADOS, appointment.status)}
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

    /*
    * La hora que se ha elegido, en el formato en que se guarda.
    * Sin las dos partes no hay hora: "10:" no es una hora, y
    * guardarlo dejaría una cita que la tabla no sabe enseñar.
    */

    function hora() {

        const h =
            document.getElementById("appointmentHour").value;

        const m =
            document.getElementById("appointmentMinute").value;

        return h && m
            ? `${h}:${m}`
            : "";

    }

    function save(appointment = {}) {

        const newAppointment = {

            id: appointment.id,

            subject: document
                .getElementById("appointmentSubject")
                .value
                .trim(),

            date: document
                .getElementById("appointmentDate")
                .value,

            time: hora(),

            company: document
                .getElementById("appointmentCompany")
                .value,

            /*
            * Del autocompletado se lee lo elegido, no lo escrito:
            * escribir "Jua" y marcharse no es haber elegido a
            * nadie.
            */

            contact: document
                .getElementById("appointmentContactValor")
                .value,

            quote: document
                .getElementById("appointmentQuote")
                .value,

            status: document
                .getElementById("appointmentStatus")
                .value

        };

        if (!newAppointment.subject) {

            Toast.error("El asunto de la cita es obligatorio.");

            return;

        }

        if (!newAppointment.date) {

            Toast.error("La fecha es obligatoria.");

            return;

        }

        /*
        * La hora se exige o no según lo que diga Configuración.
        * Hay citas que se conciertan para un día y la hora se
        * concreta después.
        */

        if (Settings.horaObligatoria() && !newAppointment.time) {

            Toast.error("La hora es obligatoria.");

            return;

        }

        /*
        * Y la cita tiene que caer dentro del horario de trabajo.
        *
        * Se comprueba aquí, al guardar, además de ofrecer sólo
        * las horas del horario: la fecha se escribe a mano y el
        * calendario del navegador no sabe qué días se atiende,
        * así que un domingo se cuela sin que nadie lo ofrezca.
        */

        if (!Settings.esDiaDeTrabajo(newAppointment.date)) {

            Toast.error(
                `Ese día no se atiende. El horario es ${Settings.horarioEnPalabras()}.`
            );

            return;

        }

        if (!Settings.estaEnHorario(newAppointment.time)) {

            Toast.error(
                `Esa hora está fuera del horario, que es ${Settings.horarioEnPalabras()}.`
            );

            return;

        }

        if (!newAppointment.contact) {

            Toast.error("Elige un contacto de la lista.");

            return;

        }

        if (appointment.id) {

            Appointments.update(newAppointment);

        } else {

            Appointments.create(newAppointment);

        }

        CrudPage.pintar();

        Modal.close();

    }

    return {

        /*
        * date: el día que se ha pulsado en el calendario. Abrir
        * el formulario ya con esa fecha es la razón de que se
        * pueda pulsar un día.
        */

        open(appointment = {}, date = null) {

            Modal.open(
                html(
                    date
                        ? { ...appointment, date }
                        : appointment
                )
            );

            Wizard.create();

            const empresa =
                document.getElementById("appointmentCompany");

            /*
            * Los contactos que se ofrecen son los de la empresa
            * elegida. `valores` es una función y se pregunta cada
            * vez que se escribe, así que cambiar de empresa
            * cambia la lista sin tener que rehacer nada.
            */

            Autocomplete.crear({

                campo: "appointmentContact",

                valores: () => Appointments.contactosDe(empresa.value)

            });

            /*
            * Al cambiar de empresa, lo que ya estuviera elegido
            * deja de valer: el contacto y el presupuesto eran de
            * la otra. Se vacían en lugar de dejarlos puestos y
            * mintiendo.
            */

            empresa.addEventListener("change", () => {

                document.getElementById("appointmentQuote").innerHTML =
                    quoteOptions(empresa.value, "");

                document.getElementById("appointmentContact").value = "";

                document.getElementById("appointmentContactValor").value = "";

            });

            document
                .getElementById("cancelButton")
                .onclick = Modal.close;

            document
                .getElementById("saveButton")
                .onclick = () => save(appointment);

        }

    };

})();
