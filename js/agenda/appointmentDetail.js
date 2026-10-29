/*
* La ficha de una cita. Enlaza con las dos entidades de las que
* cuelga: la empresa y el contacto.
*/

const AppointmentDetail = (() => {

    function empresaDe(cita) {

        const empresa =
            (Companies.findAll() || [])
                .find(c => c.name === cita.company);

        return empresa
            ? Detail.enlace("companies.html", empresa.id, empresa.name)
            : (cita.company || "");

    }

    function contactoDe(cita) {

        const contacto =
            (Contacts.findAll() || [])
                .find(c => c.name === cita.contact);

        return contacto
            ? Detail.enlace("contacts.html", contacto.id, contacto.name)
            : (cita.contact || "");

    }

    /*
    * El presupuesto para el que se ha concertado la cita, si es de
    * alguno. La mayoría no lo son, y entonces se dice: un hueco en
    * blanco no distingue "no tiene" de "no se ha cargado".
    */

    function presupuestoDe(cita) {

        if (!cita.quote) {

            return "Ninguno";

        }

        const quote =
            (Quotes.findAll() || [])
                .find(q => q.code === cita.quote);

        return quote
            ? Detail.enlace("quotes.html", quote.id, quote.code)
            : cita.quote;

    }

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            Companies.load();

            Contacts.load();

            Quotes.load();

            const registro =
                Detail.create({

                entidad:
                    "Cita",

                repositorio:
                    Appointments,

                titulo:
                    cita => cita.subject,

                datos:
                    cita => [

                        ["Asunto", cita.subject],

                        ["Fecha", Appointments.fecha(cita.date)],

                        ["Hora", cita.time],

                        ["Empresa", empresaDe(cita)],

                        ["Contacto", contactoDe(cita)],

                        ["Presupuesto", presupuestoDe(cita)],

                        ["Estado", Badge.status(cita.status)]

                    ],

                editar:
                    registro => AppointmentForm.open(registro)

            });

            /*
            * Los documentos son de este registro, no del módulo.
            */

            if (registro) {

                Documents.create({

                    modulo: "agenda",

                    registro: registro.id,

                    titulo: registro.subject

                });

                /*
                * Y los comentarios, que son de este registro por el
                * mismo motivo que los documentos: lo que alguien anotó
                * sobre un registro es de ese registro, no del módulo.
                */

                Comments.create({

                    modulo: "agenda",

                    registro: registro.id

                });

            }

        }

    };

})();
