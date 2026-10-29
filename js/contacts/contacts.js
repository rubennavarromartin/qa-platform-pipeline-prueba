const Contacts = (() => {

    const contacts = [

        {
            id: 1,
            name: "Juan Pérez",
            company: "Bosonit",
            email: "juan@bosonit.com",
            phone: "600111222",
            status: "Activo"
        },

        {
            id: 2,
            name: "Ana López",
            company: "Babel",
            email: "ana@babelgroup.com",
            phone: "600333444",
            status: "Activo"
        },

        {
            id: 3,
            name: "Carlos Ruiz",
            company: "Microsoft",
            email: "carlos@microsoft.com",
            phone: "699123123",
            status: "Inactivo"
        },

        {
            id: 4,
            name: "Marta Gil",
            company: "Aceros del Norte",
            email: "marta.gil@acerosnorte.es",
            phone: "944000004",
            status: "Activo"
        },

        {
            id: 5,
            name: "Luis Serrano",
            company: "Bodegas Riojanas",
            email: "luis.serrano@bodegasriojanas.es",
            phone: "941000005",
            status: "Activo"
        },

        {
            id: 6,
            name: "Elena Prieto",
            company: "Clínica Sanitas",
            email: "elena.prieto@clinicasanitas.es",
            phone: "963000006",
            status: "Activo"
        },

        {
            id: 7,
            name: "Óscar Navas",
            company: "Distribuciones Levante",
            email: "oscar.navas@dlevante.es",
            phone: "965000007",
            status: "Inactivo"
        },

        {
            id: 8,
            name: "Nuria Cano",
            company: "Editorial Cantábrico",
            email: "nuria.cano@edcantabrico.es",
            phone: "942000008",
            status: "Activo"
        },

        {
            id: 9,
            name: "Pablo Marín",
            company: "Ferretería Central",
            email: "pablo.marin@ferrcentral.es",
            phone: "976000009",
            status: "Activo"
        },

        {
            id: 10,
            name: "Sara Bermejo",
            company: "Gestoría Duero",
            email: "sara.bermejo@gduero.es",
            phone: "983000010",
            status: "Activo"
        },

        {
            id: 11,
            name: "Iván Losada",
            company: "Hoteles Atlántico",
            email: "ivan.losada@hatlantico.es",
            phone: "981000011",
            status: "Activo"
        },

        {
            id: 12,
            name: "Rocío Vega",
            company: "Industrias Guadalquivir",
            email: "rocio.vega@iguadalquivir.es",
            phone: "954000012",
            status: "Inactivo"
        },

        {
            id: 13,
            name: "Diego Ferrer",
            company: "Joyería Mediterránea",
            email: "diego.ferrer@jmediterranea.es",
            phone: "952000013",
            status: "Activo"
        },

        {
            id: 14,
            name: "Lucía Ibáñez",
            company: "Laboratorios Ebro",
            email: "lucia.ibanez@labebro.es",
            phone: "941000014",
            status: "Activo"
        }

    ];

    const STORAGE_KEY = "crm-demo-contacts";

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad. Se anota en el repositorio y no en el
    * formulario: por aquí pasan todos los caminos.
    */

    function anotar(accion, contact) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Contacto",

            accion: Log.ACCIONES[accion],

            registro: contact?.name,

            id: contact?.id

        });

    }

    return {

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            contacts.length = 0;

            contacts.push(

                ...JSON.parse(data)

            );

        },

        findAll() {

            return [...contacts];

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return contacts.filter(c =>

                c.name.toLowerCase().includes(text)
                ||
                c.company.toLowerCase().includes(text)

            );

        },

        create(contact) {

          contact.id = Date.now();

          contacts.push(contact);

          this.save();

          anotar("ALTA", contact);

          return contact;

      },

      update(contact) {

          const index =
              contacts.findIndex(
                  c => c.id === contact.id
              );

          if (index >= 0) {

              contacts[index] = contact;

              this.save();

              anotar("EDICION", contact);

          }

      },

      remove(id) {

          const index =
              contacts.findIndex(
                  c => c.id == id
              );

          if (index >= 0) {

              /*
              * El contacto se lee antes de quitarlo: después ya
              * no hay de dónde sacar su nombre para el log.
              */

              const contact =
                  contacts[index];

              contacts.splice(index,1);

              this.save();

              anotar("BAJA", contact);

          }

      },

      findById(id){

          return contacts.find(
              c => c.id == id
          );

      },

      /*
      * Los contactos de una empresa. Es la relación: una empresa
      * tiene varios contactos, y cada contacto pertenece a una.
      *
      * Se guarda el nombre de la empresa y no su identificador
      * porque es lo que la tabla enseña y lo que el buscador
      * busca. Tiene su precio —renombrar una empresa deja a sus
      * contactos apuntando al nombre viejo— y está anotado.
      */

      /*
      * Los nombres de los contactos, para quien tenga que
      * ofrecerlos: una cita se concierta con uno.
      */

      nombres(){

          const guardados =
              localStorage.getItem(STORAGE_KEY);

          return (
              guardados
                  ? JSON.parse(guardados)
                  : contacts
          ).map(c => c.name);

      },

      findByCompany(company){

          const nombre =
              String(company || "").toLowerCase();

          return contacts.filter(
              c => (c.company || "").toLowerCase() === nombre
          );

      },

      save() {

          localStorage.setItem(

              STORAGE_KEY,

              JSON.stringify(contacts)

          );

      },

    };

})();
