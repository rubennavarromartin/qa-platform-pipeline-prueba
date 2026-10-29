/*
* La ficha de una empresa: qué enseña y qué lleva colgando.
*
* De leer la dirección, cambiar de vista y pintar se ocupa el
* componente Detail; aquí sólo está lo que es de las empresas.
*/

const CompanyDetail = (() => {

    /*
    * El botón de alta de una pestaña.
    *
    * Se engancha en cada pintado y con `onclick` en lugar de
    * `addEventListener`: la ficha se repinta cada vez que se
    * cierra un diálogo, y con un enganche que se suma cada vez,
    * dar de alta dos registros seguidos abriría dos formularios.
    *
    * Y no se engancha si el formulario del otro módulo no está
    * cargado: mejor un botón que no hace nada que una pantalla
    * que se rompe al pulsarlo.
    */

    function alta(id, abrir) {

        const boton =
            document.getElementById(id);

        if (boton) {

            boton.onclick = abrir;

        }

    }

    /*
    * Los proyectos de la empresa.
    *
    * Se buscan por el **identificador** de la empresa y no por su nombre,
    * que es como se buscan los contactos. No es una incoherencia: los
    * contactos guardan el nombre de su empresa desde el primer día y
    * cambiarlo ahora sería otro trabajo; un proyecto nació guardando el
    * identificador, que es lo correcto — si alguien renombra la empresa, sus
    * proyectos siguen siendo suyos.
    */

    function proyectosDe(company) {

        if (typeof Projects === "undefined") {

            return;

        }

        Projects.load();

        if (typeof ProjectStatuses !== "undefined") {

            ProjectStatuses.load();

        }

        RelatedTable.render({

            nombre:
                "Proyectos",

            titulo:
                `Proyectos de ${company.name}`,

            columnas:
                ["Proyecto", "Estado", "Entrega", "Avance"],

            registros:
                Projects.findByCompany(company.id),

            fila:
                proyecto => [

                    Detail.enlace("projects.html", proyecto.id, proyecto.name),

                    Badge.status(Projects.estadoDe(proyecto)),

                    proyecto.dueDate || "",

                    `${proyecto.avance ?? 0}%`

                ],

            vacio:
                `${company.name} no tiene proyectos.`

        });

    }

    function contactosDe(company) {

        Contacts.load();

        RelatedTable.render({

            nombre:
                "Contactos",

            titulo:
                `Contactos de ${company.name}`,

            columnas:
                ["Nombre", "Email", "Teléfono", "Estado"],

            registros:
                Contacts.findByCompany(company.name),

            fila:
                contacto => [

                    Detail.enlace("contacts.html", contacto.id, contacto.name),

                    contacto.email,

                    contacto.phone,

                    Badge.status(contacto.status)

                ],

            vacio:
                `${company.name} no tiene contactos.`

        });

        /*
        * El contacto nace con esta empresa puesta: se está dando
        * de alta desde su ficha, así que preguntarla otra vez
        * sería preguntar algo que ya se sabe.
        */

        if (typeof ContactForm !== "undefined") {

            alta(
                "fichaNuevoContactoButton",
                () => ContactForm.open({ company: company.name })
            );

        }

    }

    /*
    * Los presupuestos de la empresa.
    *
    * El importe no está en el registro: se calcula sumando las
    * líneas, con su descuento y su IVA. Se pide al repositorio de
    * Presupuestos, que es quien sabe hacer esa cuenta; hacerla
    * aquí sería tener dos sitios donde se calcula un total y
    * ninguna forma de saber cuál está bien.
    */

    function presupuestosDe(company) {

        Quotes.load();

        RelatedTable.render({

            nombre:
                "Presupuestos",

            titulo:
                `Presupuestos de ${company.name}`,

            columnas:
                ["Código", "Fecha", "Estado", "Total"],

            registros:
                Quotes.findByCompany(company.name),

            fila:
                quote => [

                    Detail.enlace("quotes.html", quote.id, quote.code),

                    quote.createdAt,

                    Badge.status(quote.status),

                    `${Quotes.totales(quote).total.toFixed(2)} €`

                ],

            vacio:
                `${company.name} no tiene presupuestos.`

        });

        if (typeof QuoteForm !== "undefined") {

            alta(
                "fichaNuevoPresupuestoButton",
                () => QuoteForm.open({ company: company.name })
            );

        }

    }

    /*
    * Las citas de la empresa: las de todos sus contactos.
    *
    * Se piden por empresa y no contacto a contacto porque es como
    * las guarda la Agenda —una cita lleva su empresa y su
    * contacto—, y así aparecen también las que no tienen contacto
    * asignado, que existen.
    */

    function citasDe(company) {

        Appointments.load();

        RelatedTable.render({

            nombre:
                "Citas",

            titulo:
                `Citas de ${company.name}`,

            columnas:
                ["Asunto", "Fecha", "Hora", "Contacto", "Estado"],

            registros:
                Appointments.findByCompany(company.name),

            fila:
                cita => [

                    Detail.enlace("agenda.html", cita.id, cita.subject),

                    Appointments.fecha(cita.date),

                    cita.time || "—",

                    Detail.enlace(
                        "contacts.html",
                        Contacts.findAll()
                            .find(c => c.name === cita.contact)?.id ?? null,
                        cita.contact
                    ),

                    Badge.status(cita.status)

                ],

            vacio:
                `${company.name} no tiene citas.`

        });

        /*
        * La cita nace con la empresa puesta y el contacto en
        * blanco: quién la atiende se elige de entre los contactos
        * de esta empresa, y eso no lo puede decidir la ficha.
        */

        if (typeof AppointmentForm !== "undefined") {

            alta(
                "fichaNuevaCitaButton",
                () => AppointmentForm.open({ company: company.name })
            );

        }

    }

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            const registro =
                Detail.create({

                entidad:
                    "Empresa",

                repositorio:
                    Companies,

                titulo:
                    company => company.name,

                datos:
                    company => [

                        ["Empresa", company.name],

                        ["CIF", company.taxId],

                        ["Provincia", Provinces.provinciaDe(company.city)],

                        ["Municipio", company.city],

                        ["Estado", Badge.status(company.status)]

                    ],

                alCargar:
                    company => {

                        contactosDe(company);

        proyectosDe(company);

                        presupuestosDe(company);

                        citasDe(company);

                    },

                editar:
                    registro => CompanyForm.open(registro)

            });

            /*
            * Los documentos son de este registro, no del módulo.
            */

            if (registro) {

                Documents.create({

                    modulo: "empresas",

                    registro: registro.id,

                    titulo: registro.name

                });

                /*
                * Y los comentarios, que son de este registro por el
                * mismo motivo que los documentos: lo que alguien anotó
                * sobre un registro es de ese registro, no del módulo.
                */

                Comments.create({

                    modulo: "empresas",

                    registro: registro.id

                });

            }

        }

    };

})();
