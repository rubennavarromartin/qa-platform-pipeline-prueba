const Appointments = (() => {

    const ESTADOS = [

        "Pendiente",
        "Realizada",
        "Cancelada"

    ];

    /*
    * Las empresas con las que se puede concertar una cita salen
    * del módulo de Empresas. Si esa pantalla no está cargada, se
    * cae a una lista mínima: una cita sin empresa no se entiende.
    */

    const EMPRESAS = [

        "Bosonit",
        "Babel",
        "Microsoft"

    ];

    /*
    * Con quién se puede concertar una cita. Igual que con las
    * empresas: la lista sale del módulo de Contactos.
    */

    const CONTACTOS = [

        "Juan Pérez",
        "Ana López",
        "Carlos Ruiz"

    ];

    const appointments = [

        {
            id: 1,
            subject: "Presentación de la plataforma",
            date: "2026-08-12",
            time: "10:00",
            company: "Bosonit",
            contact: "Juan Pérez",
            quote: "PRE-2026-001",
            status: "Pendiente"
        },

        {
            id: 2,
            subject: "Revisión trimestral",
            date: "2026-08-12",
            time: "16:30",
            company: "Babel",
            contact: "Ana López",
            quote: "PRE-2026-002",
            status: "Pendiente"
        },

        {
            id: 3,
            subject: "Cierre de contrato",
            date: "2026-08-27",
            time: "09:15",
            company: "Microsoft",
            contact: "Carlos Ruiz",
            quote: "PRE-2026-003",
            status: "Realizada"
        },

        {
            id: 4,
            subject: "Visita a planta",
            date: "2026-08-13",
            time: "11:00",
            company: "Aceros del Norte",
            contact: "Marta Gil",
            quote: "PRE-2026-004",
            status: "Pendiente"
        },

        {
            id: 5,
            subject: "Cata de producto",
            date: "2026-08-14",
            time: "12:30",
            company: "Bodegas Riojanas",
            contact: "Luis Serrano",
            status: "Realizada"
        },

        {
            id: 6,
            subject: "Renovación del seguro",
            date: "2026-08-18",
            time: "09:00",
            company: "Clínica Sanitas",
            contact: "Elena Prieto",
            status: "Pendiente"
        },

        {
            id: 7,
            subject: "Revisión de rutas",
            date: "2026-08-19",
            time: "15:45",
            company: "Distribuciones Levante",
            contact: "Óscar Navas",
            status: "Cancelada"
        },

        {
            id: 8,
            subject: "Presentación de catálogo",
            date: "2026-08-21",
            time: "10:30",
            company: "Editorial Cantábrico",
            contact: "Nuria Cano",
            status: "Pendiente"
        },

        {
            id: 9,
            subject: "Inventario de temporada",
            date: "2026-08-24",
            time: "08:30",
            company: "Ferretería Central",
            contact: "Pablo Marín",
            status: "Pendiente"
        },

        {
            id: 10,
            subject: "Cierre fiscal",
            date: "2026-08-26",
            time: "17:00",
            company: "Gestoría Duero",
            contact: "Sara Bermejo",
            status: "Realizada"
        },

        {
            id: 11,
            subject: "Negociación de tarifas",
            date: "2026-08-28",
            time: "13:00",
            company: "Hoteles Atlántico",
            contact: "Iván Losada",
            status: "Pendiente"
        },

        {
            id: 12,
            subject: "Auditoría de calidad",
            date: "2026-09-02",
            time: "09:30",
            company: "Industrias Guadalquivir",
            contact: "Rocío Vega",
            status: "Pendiente"
        },

        {
            id: 13,
            subject: "Reposición de escaparate",
            date: "2026-09-04",
            time: "11:15",
            company: "Joyería Mediterránea",
            contact: "Diego Ferrer",
            status: "Pendiente"
        },

        {
            id: 14,
            subject: "Validación de ensayos",
            date: "2026-09-08",
            time: "16:00",
            company: "Laboratorios Ebro",
            contact: "Lucía Ibáñez",
            status: "Pendiente"
        },

        /*
        * Estas dos son del mismo presupuesto que la primera, y están
        * aquí por eso: un presupuesto se presenta, se negocia y se
        * firma, y cada cosa es una cita.
        *
        * Sin varias citas apuntando al mismo presupuesto, la relación
        * se leería como uno a uno y no es: es la primera de este
        * laboratorio donde un registro tiene varios del otro lado
        * **y** el otro lado se elige de una lista.
        */

        {
            id: 15,
            subject: "Negociación del presupuesto",
            date: "2026-09-10",
            time: "10:00",
            company: "Bosonit",
            contact: "Juan Pérez",
            quote: "PRE-2026-001",
            status: "Pendiente"
        },

        {
            id: 16,
            subject: "Firma del presupuesto",
            date: "2026-09-15",
            time: "12:00",
            company: "Bosonit",
            contact: "Juan Pérez",
            quote: "PRE-2026-001",
            status: "Pendiente"
        }

    ];

    const STORAGE_KEY = "qa-platform-agenda";

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad. Se anota en el repositorio y no en el
    * formulario: una cita también se borra desde el calendario.
    */

    function anotar(accion, appointment) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Cita",

            accion: Log.ACCIONES[accion],

            registro: appointment?.subject,

            id: appointment?.id,

            detalle:
                [appointment?.company, appointment?.date]
                    .filter(Boolean)
                    .join(" · ")

        });

    }

    return {

        ESTADOS,

        /*
        * Las fechas se guardan como las entiende el navegador
        * (2026-08-12) y se enseñan como las lee una persona.
        *
        * Vive aquí y no en la pantalla de la Agenda porque las
        * citas se enseñan en más sitios: la ficha de un contacto
        * también lista las suyas.
        */

        fecha(valor) {

            if (!valor) {

                return "";

            }

            const [year, month, day] = valor.split("-");

            return `${day}/${month}/${year}`;

        },

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            appointments.length = 0;

            appointments.push(...JSON.parse(data));

        },

        findAll() {

            return [...appointments];

        },

        /*
        * Las citas de un día, en orden de hora. El calendario las
        * pinta así y la tabla no las necesita ordenadas.
        */

        findByDate(date) {

            return appointments

                .filter(a => a.date === date)

                .sort((a, b) => a.time.localeCompare(b.time));

        },

        /*
        * Las empresas las tiene su módulo, y se le preguntan a
        * él. Antes esto leía por su cuenta el almacén de
        * Empresas: dos sitios sabiendo cómo se guardan las
        * empresas es uno de más.
        */

        empresas() {

            const nombres =
                typeof Companies !== "undefined"
                    ? Companies.nombres()
                    : [];

            return nombres.length
                ? nombres
                : EMPRESAS;

        },

        contactos() {

            const nombres =
                typeof Contacts !== "undefined"
                    ? Contacts.nombres()
                    : [];

            return nombres.length
                ? nombres
                : CONTACTOS;

        },

        /*
        * Los presupuestos para los que se puede concertar una cita.
        * Igual que las empresas y los contactos: la lista sale del
        * módulo de Presupuestos.
        *
        * Si esa pantalla no está cargada, no se ofrece ninguno en
        * lugar de caerse a una lista mínima: una cita sin
        * presupuesto se entiende perfectamente —la mayoría no lo
        * tienen— y un código inventado apuntaría a un presupuesto
        * que no existe.
        */

        presupuestos() {

            return typeof Quotes !== "undefined"
                ? Quotes.codigos()
                : [];

        },

        /*
        * Los contactos y los presupuestos de una empresa.
        *
        * Una cita se concierta con una empresa, y con alguien de
        * esa empresa: ofrecer los catorce contactos del CRM
        * cuando ya se sabe la empresa es ofrecer trece
        * equivocados. Lo mismo con los presupuestos.
        *
        * Sin empresa elegida se ofrecen todos, que es lo único
        * que se puede hacer: no hay por dónde acotar.
        */

        contactosDe(empresa) {

            if (!empresa || typeof Contacts === "undefined") {

                return this.contactos();

            }

            /*
            * Se carga antes de preguntar.
            *
            * `findByCompany` mira la lista que el repositorio
            * tiene en memoria, y en esta pantalla nadie la había
            * cargado: eran los catorce contactos de partida, así
            * que los que se hubieran dado de alta después no
            * aparecían. Es la diferencia entre este método y
            * `contactos()`, que lee lo guardado por su cuenta.
            */

            Contacts.load?.();

            return Contacts.findByCompany(empresa).map(c => c.name);

        },

        presupuestosDe(empresa) {

            if (!empresa || typeof Quotes === "undefined") {

                return this.presupuestos();

            }

            Quotes.load?.();

            return Quotes.findByCompany(empresa).map(q => q.code);

        },

        /*
        * Las citas de una empresa y las de un contacto. Son las
        * relaciones al revés: una cita se concierta con una
        * empresa y con un contacto, y desde el otro lado hace
        * falta saber cuáles tiene cada uno —para su ficha, y para
        * no borrarlo por debajo—.
        */

        findByCompany(company) {

            const nombre =
                String(company || "").toLowerCase();

            return appointments.filter(
                a => (a.company || "").toLowerCase() === nombre
            );

        },

        findByContact(contact) {

            const nombre =
                String(contact || "").toLowerCase();

            return appointments

                .filter(a => (a.contact || "").toLowerCase() === nombre)

                .sort((a, b) =>
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
                );

        },

        /*
        * Y las citas de un presupuesto, que son varias: presentarlo,
        * negociarlo, firmarlo.
        *
        * Ordenadas por cuándo son, que es el orden en el que
        * significan algo: la negociación va después de la
        * presentación.
        */

        findByQuote(code) {

            const codigo =
                String(code || "").toLowerCase();

            if (!codigo) {

                return [];

            }

            return appointments

                .filter(a => (a.quote || "").toLowerCase() === codigo)

                .sort((a, b) =>
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
                );

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return appointments.filter(a =>

                a.subject.toLowerCase().includes(text)
                ||
                a.company.toLowerCase().includes(text)
                ||
                a.date.includes(text)

            );

        },

        create(appointment) {

            appointment.id = Date.now();

            appointments.push(appointment);

            this.save();

            anotar("ALTA", appointment);

            return appointment;

        },

        update(appointment) {

            const index = appointments.findIndex(

                a => a.id === appointment.id

            );

            if (index >= 0) {

                appointments[index] = appointment;

                this.save();

                anotar("EDICION", appointment);

            }

        },

        remove(id) {

            const index = appointments.findIndex(

                a => a.id == id

            );

            if (index >= 0) {

                /*
                * La cita se lee antes de quitarla: después ya no
                * hay de dónde sacar su asunto para el log.
                */

                const appointment =
                    appointments[index];

                appointments.splice(index, 1);

                this.save();

                anotar("BAJA", appointment);

            }

        },

        findById(id) {

            return appointments.find(

                a => a.id == id

            );

        },

        save() {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(appointments)

            );

        }

    };

})();
