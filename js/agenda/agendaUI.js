const AgendaUI = (() => {

    /*
    * Cómo se enseña una fecha lo decide el repositorio de citas:
    * las citas se pintan en más sitios que esta pantalla.
    */

    const fecha =
        valor => Appointments.fecha(valor);

    function renderRow(appointment) {

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(appointment.id)}

    <td>
        <a
            class="ficha"
            href="agenda.html?id=${appointment.id}">
            ${appointment.subject}
        </a>
    </td>

    <td>${fecha(appointment.date)}</td>

    <td>${appointment.time || ""}</td>

    <td>${appointment.company || ""}</td>

    <td>${appointment.contact || ""}</td>

    <td>${appointment.quote || ""}</td>

    <td>${Badge.status(appointment.status)}</td>

    <td>

        <div class="action-buttons">


            <button
                class="btn-delete"
                data-id="${appointment.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    function bindEvents() {

        document
            .querySelectorAll("#agendaGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const appointment =
                        Appointments.findById(id);

                    if (!appointment) {

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar la cita "${appointment.subject}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }
                    Appointments.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    return {

        fecha,

        /*
        * La tabla pinta lo que le den —que puede venir filtrado
        * por el buscador— y el calendario se repinta siempre con
        * todo: un mes con huecos según lo que haya escrito uno en
        * el buscador no sería un calendario.
        */

        renderTable(appointments) {

            DataTable.render(
                "#agendaGrid tbody",
                appointments.map(renderRow)
            );

            bindEvents();

            AgendaCalendar.render();

        }

    };

})();
