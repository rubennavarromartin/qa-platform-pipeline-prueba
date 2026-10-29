const Companies = (() => {

    /*
    * Catorce empresas, y no tres, a propósito: son más de las que
    * caben en una página.
    *
    * Cada prueba de Playwright arranca con el navegador limpio, o
    * sea con estos datos y no con los que haya guardados. Si
    * cupieran en una página, la paginación no se activaría nunca
    * mientras se prueba, y una prueba que cuenta filas pasaría
    * por casualidad: el día que la aplicación real tuviera más
    * registros, empezaría a fallar sin que nada estuviera roto.
    *
    * Las tres primeras se quedan como estaban porque los
    * contactos y las citas las nombran.
    */

    const companies = [

        {
            id: 1,
            name: "Bosonit",
            taxId: "B12345678",
            city: "Logroño",
            status: "Activo"
        },

        {
            id: 2,
            name: "Babel",
            taxId: "A87654321",
            city: "Madrid",
            status: "Activo"
        },

        {
            id: 3,
            name: "Microsoft",
            taxId: "A99999999",
            city: "Barcelona",
            status: "Inactivo"
        },

        {
            id: 4,
            name: "Aceros del Norte",
            taxId: "B10000004",
            city: "Bilbao",
            status: "Activo"
        },

        {
            id: 5,
            name: "Bodegas Riojanas",
            taxId: "B10000005",
            city: "Haro",
            status: "Activo"
        },

        {
            id: 6,
            name: "Clínica Sanitas",
            taxId: "B10000006",
            city: "Valencia",
            status: "Activo"
        },

        {
            id: 7,
            name: "Distribuciones Levante",
            taxId: "B10000007",
            city: "Alicante",
            status: "Inactivo"
        },

        {
            id: 8,
            name: "Editorial Cantábrico",
            taxId: "B10000008",
            city: "Santander",
            status: "Activo"
        },

        {
            id: 9,
            name: "Ferretería Central",
            taxId: "B10000009",
            city: "Zaragoza",
            status: "Activo"
        },

        {
            id: 10,
            name: "Gestoría Duero",
            taxId: "B10000010",
            city: "Valladolid",
            status: "Activo"
        },

        {
            id: 11,
            name: "Hoteles Atlántico",
            taxId: "B10000011",
            city: "A Coruña",
            status: "Inactivo"
        },

        {
            id: 12,
            name: "Industrias Guadalquivir",
            taxId: "B10000012",
            city: "Sevilla",
            status: "Activo"
        },

        {
            id: 13,
            name: "Joyería Mediterránea",
            taxId: "B10000013",
            city: "Málaga",
            status: "Activo"
        },

        {
            id: 14,
            name: "Laboratorios Ebro",
            taxId: "B10000014",
            city: "Logroño",
            status: "Activo"
        }

    ];

    const STORAGE_KEY = "qa-platform-companies";

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad.
    *
    * Se anota aquí y no en el formulario porque una empresa se
    * puede borrar desde la ficha, desde su fila o desde
    * "eliminar seleccionados", y son tres sitios distintos: por
    * el repositorio pasan los tres.
    *
    * El `typeof` no sobra: si una pantalla no cargara el log,
    * guardar una empresa no puede romperse por eso.
    */

    function anotar(accion, company) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Empresa",

            accion: Log.ACCIONES[accion],

            registro: company?.name,

            id: company?.id

        });

    }

    return {

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            companies.length = 0;

            companies.push(...JSON.parse(data));

        },

        findAll() {

            return [...companies];

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return companies.filter(c =>

                c.name.toLowerCase().includes(text)
                ||
                c.taxId.toLowerCase().includes(text)
                ||
                c.city.toLowerCase().includes(text)

            );

        },

        create(company) {

            company.id = Date.now();

            companies.push(company);

            this.save();

            anotar("ALTA", company);

            return company;

        },

        update(company) {

            const index = companies.findIndex(

                c => c.id === company.id

            );

            if (index >= 0) {

                companies[index] = company;

                this.save();

                anotar("EDICION", company);

            }

        },

        remove(id) {

            const index = companies.findIndex(

                c => c.id == id

            );

            if (index >= 0) {

                /*
                * La empresa se lee antes de quitarla: después ya
                * no hay de dónde sacar su nombre para el log.
                */

                const company =
                    companies[index];

                companies.splice(index, 1);

                this.save();

                anotar("BAJA", company);

            }

        },

        findById(id) {

            return companies.find(

                c => c.id == id

            );

        },

        /*
        * Los nombres de las empresas, para quien tenga que
        * ofrecerlas: un contacto pertenece a una, y una cita se
        * concierta con una.
        *
        * Se lee de lo guardado y no de la memoria porque quien
        * pregunta suele ser otra pantalla, que no ha cargado este
        * repositorio. Si no hay nada guardado, valen las de
        * partida.
        */

        nombres() {

            const guardadas =
                localStorage.getItem(STORAGE_KEY);

            return (
                guardadas
                    ? JSON.parse(guardadas)
                    : companies
            ).map(c => c.name);

        },

        save() {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(companies)

            );

        }

    };

})();
