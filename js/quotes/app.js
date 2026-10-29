document.addEventListener("DOMContentLoaded", () => {

    /*
    * Los repositorios de los que cuelga un presupuesto o que cuelgan
    * de él: las empresas para el autocompletado y la ficha, los
    * usuarios para saber quién comenta, y las citas para no borrar un
    * presupuesto que tenga alguna.
    */

    Companies.load();

    Users.load();

    Appointments.load();

    /*
    * La dirección manda: con `?id=` se monta la ficha y nada más.
    */

    if (QuoteDetail.pedida()) {

        QuoteDetail.create();

        return;

    }

    CrudPage.create({

        entity: "quotes",

        repository: Quotes,

        ui: QuoteUI,

        form: QuoteForm,

        searchId: "search",

        newButtonId: "newQuoteButton",

        tabla: "#quotesGrid",

        columnas: [
            {},
            { titulo: "Código", campo: "code" },
            { titulo: "Empresa", campo: "company" },
            { titulo: "Fecha", campo: "createdAt" },
            { titulo: "Estado", campo: "status" },
            {},
            {}
        ],

        /*
        * Un presupuesto con citas concertadas no se borra: la cita se
        * quedaría apuntando a un presupuesto que no existe.
        *
        * El total no se pone aquí aunque sea una columna: no ordena
        * por un campo del registro, sale de sumar las líneas.
        * Ordenarlo pediría comparar por lo calculado, y `Sortable`
        * ordena por campos.
        */

        dependenciasDe: quote => [

            {
                nombre: "citas",
                singular: "cita",
                cuantos: Appointments.findByQuote(quote.code).length
            }

        ]

    });

    /*
    * El conmutador de vistas se monta después del listado, porque
    * enseñar una vista la pinta y pintar necesita el listado ya
    * montado.
    *
    * Arranca en kanban: es la vista con la que esta pantalla se abre,
    * y de ahí sale el caso que la plataforma tiene que aprender.
    */

    const vistas =
        Views.create({

            pantalla: "presupuestos",

            inicial: "kanban",

            vistas: [

                {
                    nombre: "kanban",
                    boton: "vistaKanbanButton",
                    panel: "vistaKanban",
                    alMostrar: CrudPage.pintar
                },

                {
                    nombre: "tabla",
                    boton: "vistaTablaButton",
                    panel: "vistaTabla",
                    alMostrar: CrudPage.pintar
                }

            ]

        });

    QuoteUI.conVistas(vistas);

    /*
    * Y se pinta otra vez, ahora que se sabe qué vista está puesta. La
    * primera pasada la hizo `CrudPage.create` cuando todavía no había
    * conmutador, así que pintó la tabla.
    */

    CrudPage.pintar();

});
