/*
* La ficha de un contacto: sus datos, la empresa a la que
* pertenece —enlazada, que una relación se recorre— y sus citas.
*/

const ContactDetail = (() => {

    function empresaDe(contact) {

        const empresa =
            (Companies.findAll() || [])
                .find(c => c.name === contact.company);

        return empresa
            ? Detail.enlace("companies.html", empresa.id, empresa.name)
            : (contact.company || "");

    }

    function citasDe(contact) {

        Appointments.load();

        RelatedTable.render({

            nombre:
                "Citas",

            titulo:
                `Citas de ${contact.name}`,

            columnas:
                ["Asunto", "Fecha", "Hora", "Empresa", "Estado"],

            registros:
                Appointments.findByContact(contact.name),

            fila:
                cita => [

                    Detail.enlace("agenda.html", cita.id, cita.subject),

                    Appointments.fecha(cita.date),

                    cita.time,

                    cita.company,

                    Badge.status(cita.status)

                ],

            vacio:
                `${contact.name} no tiene citas.`

        });

    }

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            Companies.load();

            const registro =
                Detail.create({

                entidad:
                    "Contacto",

                repositorio:
                    Contacts,

                titulo:
                    contact => contact.name,

                datos:
                    contact => [

                        ["Nombre", contact.name],

                        ["Empresa", empresaDe(contact)],

                        ["Email", contact.email],

                        ["Teléfono", contact.phone],

                        ["Estado", Badge.status(contact.status)]

                    ],

                alCargar:
                    citasDe,

                editar:
                    registro => ContactForm.open(registro)

            });

            /*
            * Los documentos son de este registro, no del módulo.
            */

            if (registro) {

                Documents.create({

                    modulo: "contactos",

                    registro: registro.id,

                    titulo: registro.name

                });

                /*
                * Y los comentarios, que son de este registro por el
                * mismo motivo que los documentos: lo que alguien anotó
                * sobre un registro es de ese registro, no del módulo.
                */

                Comments.create({

                    modulo: "contactos",

                    registro: registro.id

                });

            }

        }

    };

})();
