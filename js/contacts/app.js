document.addEventListener("DOMContentLoaded", () => {

    /*
    * La dirección manda: con `?id=` se monta la ficha y nada
    * más. El listado no se monta, que no se ve.
    */

    if (ContactDetail.pedida()) {

        ContactDetail.create();

        return;

    }

    /*
    * Las citas, para saber al borrar si el contacto tiene alguna.
    */

    Appointments.load();

    CrudPage.create({

        entity: "contacts",

        /*
        * La única lista del laboratorio que se puede colocar **sin
        * arrastrar**, con botones de subir y bajar en cada fila.
        *
        * Las otras cinco se quedan sólo con el tirador a propósito: son el
        * caso que incumple el criterio 2.5.7 de la WCAG, y hacen falta los
        * dos casos para saber si la plataforma los distingue. Con las seis
        * igual, cualquier respuesta suya valdría.
        */

        colocarConBotones: true,

        repository: Contacts,

        ui: UI,

        form: ContactForm,

        searchId: "search",

        newButtonId: "newContactButton",

        tabla: "#contactsGrid",

        columnas: [
            {},
            { titulo: "Nombre", campo: "name" },
            { titulo: "Empresa", campo: "company" },
            { titulo: "Email", campo: "email" },
            { titulo: "Teléfono", campo: "phone" },
            { titulo: "Estado", campo: "status" },
            {}
        ],

        dependenciasDe: contact => [

            {
                nombre: "citas",
                singular: "cita",
                cuantos: Appointments.findByContact(contact.name).length
            }

        ]

    });


});
