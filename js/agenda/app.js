document.addEventListener("DOMContentLoaded", () => {

    /*
    * La dirección manda: con `?id=` se monta la ficha y nada
    * más. El listado no se monta, que no se ve.
    */

    if (AppointmentDetail.pedida()) {

        AppointmentDetail.create();

        return;

    }

    CrudPage.create({

        entity: "agenda",

        repository: Appointments,

        ui: AgendaUI,

        form: AppointmentForm,

        searchId: "search",

        newButtonId: "newAppointmentButton",

        tabla: "#agendaGrid",

        columnas: [
            {},
            { titulo: "Asunto", campo: "subject" },
            { titulo: "Fecha", campo: "date" },
            { titulo: "Hora", campo: "time" },
            { titulo: "Empresa", campo: "company" },
            { titulo: "Contacto", campo: "contact" },
            { titulo: "Presupuesto", campo: "quote" },
            { titulo: "Estado", campo: "status" },
            {}
        ]

    });

    AgendaCalendar.create();


});

/*
* Tabla, calendario y documentación son pestañas de la misma
* pantalla, y de eso se ocupa el componente Tabs. Antes la
* Agenda se apañaba con dos botones y su propio código para
* enseñar y esconder: ahora que todos los grupos funcionales
* tienen pestañas, no tiene sentido que ésta tenga las suyas.
*
* La tabla es la de partida: es donde se dan de alta las citas y
* donde se editan.
*/
