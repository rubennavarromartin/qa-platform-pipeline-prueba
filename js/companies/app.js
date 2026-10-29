document.addEventListener("DOMContentLoaded", () => {

    /*
    * La dirección manda: con `?id=` se monta la ficha de una
    * empresa y nada más. El listado y su documentación no se
    * montan, que no se ven.
    */

    if (CompanyDetail.pedida()) {

        CompanyDetail.create();

        return;

    }

    /*
    * Los repositorios de lo que cuelga de una empresa: hacen
    * falta para saber, al borrar, si tiene contactos o citas.
    */

    Contacts.load();

    Appointments.load();

    Quotes.load();

    CrudPage.create({

        entity: "companies",

        repository: Companies,

        ui: CompanyUI,

        form: CompanyForm,

        searchId: "search",

        newButtonId: "newCompanyButton",

        tabla: "#companiesGrid",

        /*
        * Las columnas de la rejilla, en orden. La primera es la
        * de las casillas y no ordena por nada; la última son las
        * acciones.
        */

        columnas: [
            {},
            { titulo: "Empresa", campo: "name" },
            { titulo: "CIF", campo: "taxId" },
            { titulo: "Ciudad", campo: "city" },
            { titulo: "Estado", campo: "status" },
            {}
        ],

        dependenciasDe: company => [

            {
                nombre: "contactos",
                singular: "contacto",
                cuantos: Contacts.findByCompany(company.name).length
            },

            {
                nombre: "citas",
                singular: "cita",
                cuantos: Appointments.findByCompany(company.name).length
            },

            /*
            * Y sus presupuestos. Faltaba, y lo cazó la prueba de
            * relaciones: se podía borrar una empresa con
            * presupuestos, y los presupuestos se quedaban
            * apuntando a un cliente que ya no existía.
            */

            {
                nombre: "presupuestos",
                singular: "presupuesto",
                cuantos: Quotes.findByCompany(company.name).length
            }

        ]

    });


});
