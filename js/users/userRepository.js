const Users = (() => {

    const users = [

        {
            id: 1,
            name: "Rubén Navarro",
            username: "ruben",
            password: "crm-2026",
            email: "ruben.navarro@bosonit.com",
            role: "Administrador",
            status: "Activo"
        },

        {
            id: 2,
            name: "Ana López",
            username: "ana",
            password: "crm-2026",
            email: "ana.lopez@babelgroup.com",
            role: "Gestor",
            status: "Activo"
        },

        {
            id: 3,
            name: "Carlos Ruiz",
            username: "carlos",
            password: "crm-2026",
            email: "carlos.ruiz@microsoft.com",
            role: "Consulta",
            status: "Inactivo"
        },

        {
            id: 4,
            name: "Marta Gil",
            username: "marta",
            password: "crm-2026",
            email: "marta.gil@bosonit.com",
            role: "Supervisor",
            status: "Activo"
        },

        {
            id: 5,
            name: "Luis Serrano",
            username: "luis",
            password: "crm-2026",
            email: "luis.serrano@bosonit.com",
            role: "Comercial",
            status: "Activo"
        },

        {
            id: 6,
            name: "Elena Prieto",
            username: "elena",
            password: "crm-2026",
            email: "elena.prieto@babelgroup.com",
            role: "Facturación",
            status: "Activo"
        },

        {
            id: 7,
            name: "Óscar Navas",
            username: "oscar",
            password: "crm-2026",
            email: "oscar.navas@babelgroup.com",
            role: "Soporte",
            status: "Activo"
        },

        {
            id: 8,
            name: "Nuria Cano",
            username: "nuria",
            password: "crm-2026",
            email: "nuria.cano@bosonit.com",
            role: "Auditor",
            status: "Activo"
        },

        {
            id: 9,
            name: "Pablo Marín",
            username: "pablo",
            password: "crm-2026",
            email: "pablo.marin@bosonit.com",
            role: "Comercial",
            status: "Inactivo"
        },

        {
            id: 10,
            name: "Sara Bermejo",
            username: "sara",
            password: "crm-2026",
            email: "sara.bermejo@babelgroup.com",
            role: "Marketing",
            status: "Activo"
        },

        {
            id: 11,
            name: "Iván Losada",
            username: "ivan",
            password: "crm-2026",
            email: "ivan.losada@bosonit.com",
            role: "Dirección",
            status: "Activo"
        },

        {
            id: 12,
            name: "Rocío Vega",
            username: "rocio",
            password: "crm-2026",
            email: "rocio.vega@babelgroup.com",
            role: "Recepción",
            status: "Activo"
        },

        {
            id: 13,
            name: "Diego Ferrer",
            username: "diego",
            password: "crm-2026",
            email: "diego.ferrer@bosonit.com",
            role: "Soporte",
            status: "Activo"
        },

        {
            id: 14,
            name: "Lucía Ibáñez",
            username: "lucia",
            password: "crm-2026",
            email: "lucia.ibanez@babelgroup.com",
            role: "Solo lectura",
            status: "Activo"
        },

        /*
        * Quien sólo ve Proyectos.
        *
        * Es el caso límite por arriba, y no hay ningún otro usuario así: su
        * rol no tiene "Ver", así que para él la aplicación es **una
        * pantalla**. Su menú tiene una entrada, su pantalla de entrada no es
        * Inicio —no puede abrirla— y desde donde está no hay salida a
        * ninguna parte.
        *
        * Hasta ahora todo lo que un papel no veía era **menos** que lo que
        * veía el principal; éste ve otra cosa y casi nada.
        */

        {
            id: 15,
            name: "Teresa Alonso",
            username: "teresa",
            password: "crm-2026",
            email: "teresa.alonso@bosonit.com",
            role: "Proyectos",
            status: "Activo"
        }

    ];

    const STORAGE_KEY = "qa-platform-users";

    const CONTRASENA = "crm-2026";

    /*
    * Los usuarios de partida, guardados aparte.
    *
    * Hacen falta porque `load` vacía la lista de arriba y la
    * rellena con lo que hubiera guardado: sin esta copia, lo de
    * partida deja de estar a mano en cuanto alguien ha usado la
    * aplicación una vez.
    */

    const DE_PARTIDA =
        users.map(usuario => ({ ...usuario }));

    /*
    * El usuario de acceso a partir del nombre: el de pila, sin
    * acentos. Es como se llaman los catorce de partida, así que
    * uno creado después se llama igual que se habría llamado si
    * hubiera estado desde el principio.
    */

    function usuarioDe(nombre) {

        return String(nombre || "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .split(" ")[0]
            .toLowerCase();

    }

    /*
    * Completa un usuario que se guardó antes de que existiera el
    * acceso.
    *
    * El laboratorio guarda los usuarios en el navegador, y lo
    * guardado manda sobre lo de partida: quien hubiera entrado
    * una sola vez antes de este cambio tenía catorce usuarios sin
    * usuario ni contraseña y no podía entrar con ninguno. Sin
    * esto, la única salida era vaciar el almacenamiento a mano,
    * que no es algo que se le pueda pedir a nadie.
    */

    function completar(usuario) {

        if (usuario.username && usuario.password) {

            return usuario;

        }

        const partida =
            DE_PARTIDA.find(u =>
                u.id === usuario.id || u.email === usuario.email
            );

        return {

            ...usuario,

            username:
                usuario.username
                || partida?.username
                || usuarioDe(usuario.name),

            password:
                usuario.password
                || partida?.password
                || CONTRASENA

        };

    }

    /*
    * Cada alta, edición y baja deja su línea en el log de
    * actividad.
    */

    function anotar(accion, user) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Usuario",

            accion: Log.ACCIONES[accion],

            registro: user?.name,

            id: user?.id,

            detalle: user?.role || ""

        });

    }

    return {

        load() {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                this.save();

                return;

            }

            const guardados =
                JSON.parse(data);

            users.length = 0;

            users.push(...guardados.map(completar));

            /*
            * Si había alguno a medias, lo completado se guarda:
            * completarlo en cada carga y no guardarlo nunca
            * dejaría el arreglo dependiendo de que este fichero
            * se cargue, y la pantalla de acceso es la única que
            * lo necesita.
            */

            /*
            * Y los que trae el código y no estaban guardados.
            *
            * Es lo mismo que hace el repositorio de Roles y por lo mismo:
            * los usuarios se siembran la primera vez, así que uno añadido
            * después no existiría para nadie que ya hubiera usado la
            * aplicación. Sólo se **añaden**: nunca se toca ni se borra uno
            * que alguien haya dado de alta.
            */

            let sembradosNuevos = false;

            for (const deFabrica of DE_PARTIDA) {

                if (!users.some(uno => uno.username === deFabrica.username)) {

                    users.push(completar({ ...deFabrica }));

                    sembradosNuevos = true;

                }

            }

            const faltaba =
                guardados.some(u => !u.username || !u.password);

            if (faltaba || sembradosNuevos) {

                this.save();

            }

        },

        findAll() {

            return [...users];

        },

        search(text) {

            if (!text) {

                return this.findAll();

            }

            text = text.toLowerCase();

            return users.filter(u =>

                u.name.toLowerCase().includes(text)
                ||
                u.email.toLowerCase().includes(text)
                ||
                u.role.toLowerCase().includes(text)

            );

        },

        create(user) {

            user.id = Date.now();

            users.push(user);

            this.save();

            anotar("ALTA", user);

            return user;

        },

        update(user) {

            const index = users.findIndex(

                u => u.id === user.id

            );

            if (index >= 0) {

                users[index] = user;

                this.save();

                anotar("EDICION", user);

            }

        },

        remove(id) {

            const index = users.findIndex(

                u => u.id == id

            );

            if (index >= 0) {

                /*
                * El usuario se lee antes de quitarlo: después ya
                * no hay de dónde sacar su nombre para el log.
                */

                const user =
                    users[index];

                users.splice(index, 1);

                this.save();

                anotar("BAJA", user);

            }

        },

        findById(id) {

            return users.find(

                u => u.id == id

            );

        },

        /*
        * Los nombres de los usuarios, para quien tenga que
        * ofrecerlos: un comentario lo escribe uno de ellos.
        *
        * Se lee de lo guardado y no de la memoria porque quien
        * pregunta suele ser otra pantalla, que no ha cargado este
        * repositorio. Si no hay nada guardado, valen los de partida.
        */

        nombres() {

            const guardados =
                localStorage.getItem(STORAGE_KEY);

            return (
                guardados
                    ? JSON.parse(guardados)
                    : users
            ).map(u => u.name);

        },

        save() {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(users)

            );

        }

    };

})();
