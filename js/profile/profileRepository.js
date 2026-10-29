/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
|
| La ficha del propio usuario: sus datos personales, los de su
| puesto, sus dos direcciones y quién es su responsable.
|
| Es la primera pantalla del laboratorio que no es un CRUD y no es
| una lista. No tiene rejilla, ni alta, ni borrado: es un registro
| único —el de quien ha entrado— repartido en secciones, con unos
| campos que se pueden cambiar y otros que no.
|
| Está aquí porque es lo que hay en las aplicaciones de verdad y
| lo que el laboratorio no tenía. Todo lo que la plataforma sabe
| probar cuelga hoy de una rejilla: una pantalla sin tabla, con
| cuarenta campos repartidos en secciones, mitad editables y mitad
| no, es la pregunta que falta por hacerle.
|
| El perfil es de cada usuario y se guarda por separado: dos
| personas que entren en el mismo navegador no comparten dirección
| ni número de cuenta.
|
| Lo que no se puede cambiar no se puede cambiar de verdad: no es
| que la pantalla lo pinte apagado, es que al guardar se conserva
| lo que había. Un campo de sólo lectura que se puede escribir
| tocando el HTML no comprueba nada.
|
*/

const Profile = (() => {

    function clave(usuario) {

        return `qa-platform-perfil-${usuario}`;

    }

    /*
    * Los campos que no se cambian desde aquí.
    *
    * No son adorno: el identificador lo pone la empresa, el
    * correo corporativo y la categoría los pone Recursos
    * Humanos, y la fecha de alta es un hecho. Se enseñan porque
    * hacen falta y se protegen porque no son de quien los mira.
    */

    const SOLO_LECTURA = [

        "id",
        "telefonoCorporativo",
        "emailCorporativo",
        "categoria",
        "alta",
        "convenio"

    ];

    const OFICINAS = [

        "Logroño",
        "Madrid",
        "Barcelona",
        "Bilbao",
        "Sevilla",
        "Teletrabajo"

    ];

    const CONVENIOS = [

        "Consultoría y estudios de mercado",
        "Oficinas y despachos",
        "Metal"

    ];

    /*
    * Las ciudades de las dos direcciones. Son las mismas en las
    * dos, y ése es medio caso: dos secciones con campos que se
    * llaman igual.
    */

    const CIUDADES = [

        "A Coruña",
        "Alicante",
        "Barcelona",
        "Bilbao",
        "Logroño",
        "Madrid",
        "Málaga",
        "Santander",
        "Sevilla",
        "Valencia",
        "Valladolid",
        "Zaragoza"

    ];

    /*
    * La ficha del usuario en el módulo de Usuarios.
    *
    * La sesión lleva lo justo para saber quién ha entrado
    * —usuario, nombre y rol—, y aquí hace falta más: el correo
    * corporativo, que es un dato suyo y no de la sesión.
    */

    function fichaDe(usuario) {

        if (typeof Users === "undefined") {

            return null;

        }

        Users.load?.();

        return Users.findAll().find(otro =>

            otro.id === usuario?.id ||
            otro.username === usuario?.username

        ) || null;

    }

    /*
    * El perfil de partida de alguien, a partir de su ficha de
    * usuario. Se saca de ahí y no se inventa para que las dos
    * pantallas cuenten lo mismo: el nombre que enseña el perfil
    * es el que está en Usuarios.
    */

    function departida(usuario) {

        const ficha =
            fichaDe(usuario);

        const nombre =
            String(usuario?.name || ficha?.name || "").trim();

        const partes =
            nombre.split(" ");

        return {

            id:
                `EMP-${String(usuario?.id || 0).padStart(4, "0")}`,

            nombre:
                partes[0] || "",

            apellidos:
                partes.slice(1).join(" "),

            telefono:
                "600 000 000",

            telefonoCorporativo:
                `941 000 ${String(usuario?.id || 0).padStart(3, "0")}`,

            email:
                `${usuario?.username || "usuario"}@ejemplo.es`,

            emailCorporativo:
                usuario?.email || ficha?.email || "",

            cuenta:
                "ES91 2100 0418 4502 0005 1332",

            swift:
                "CAIXESBBXXX",

            categoria:
                usuario?.role || ficha?.role || "",

            oficina:
                OFICINAS[0],

            horas:
                40,

            alta:
                "2021-09-01",

            convenio:
                CONVENIOS[0],

            direccion: {

                ciudad: "Logroño",

                region: "La Rioja",

                pais: "España",

                codigoPostal: "26001",

                calle: "Gran Vía 1"

            },

            envio: {

                /*
                * De partida, la de siempre. Es lo que hace que la
                * casilla mande sobre cinco campos: marcada, la
                * dirección de envío es la otra y no se toca.
                */

                mismaDireccion: true,

                ciudad: "Logroño",

                region: "La Rioja",

                pais: "España",

                codigoPostal: "26001",

                calle: "Gran Vía 1"

            },

            responsable:
                responsableDe(usuario)

        };

    }

    /*
    * Quién manda sobre alguien: el primer administrador que no
    * sea él mismo. Sale del módulo de Usuarios, como todo lo
    * demás: un responsable inventado no llevaría a ninguna ficha.
    *
    * Y si el único administrador es él —que es el caso de quien
    * manda—, el primer usuario que no sea él. Nadie es su propio
    * responsable: enseñarlo así parece un error de la aplicación,
    * y en la primera versión de esto lo parecía.
    */

    function responsableDe(usuario) {

        if (typeof Users === "undefined") {

            return { nombre: "", email: "" };

        }

        Users.load?.();

        const otros =
            Users.findAll().filter(otro => otro.id !== usuario?.id);

        const jefe =
            otros.find(otro => otro.role === "Administrador") ||
            otros.find(otro => otro.role === "Dirección") ||
            otros[0];

        return {

            id: jefe?.id ?? null,

            nombre: jefe?.name || "",

            email: jefe?.email || ""

        };

    }

    return {

        SOLO_LECTURA,

        OFICINAS,

        CONVENIOS,

        CIUDADES,

        /*
        * El perfil de quien ha entrado. Si nunca se ha guardado,
        * el de partida.
        */

        de(usuario) {

            const guardado =
                localStorage.getItem(clave(usuario?.username || "anonimo"));

            if (!guardado) {

                return departida(usuario);

            }

            try {

                return {

                    ...departida(usuario),

                    ...JSON.parse(guardado)

                };

            }
            catch {

                return departida(usuario);

            }

        },

        /*
        * Guarda los cambios, conservando lo que no se toca desde
        * aquí.
        *
        * Los campos de sólo lectura se reponen con lo que había:
        * es lo que hace que sean de sólo lectura de verdad y no
        * un `readonly` en el HTML que cualquiera puede quitar.
        */

        guardar(usuario, cambios) {

            const anterior =
                this.de(usuario);

            const nuevo =
                { ...anterior, ...cambios };

            for (const campo of SOLO_LECTURA) {

                nuevo[campo] = anterior[campo];

            }

            /*
            * Con la casilla marcada, la dirección de envío es la
            * otra. Se copia al guardar y no sólo al pintar: lo que
            * se enseña y lo que se guarda tienen que decir lo
            * mismo.
            */

            if (nuevo.envio?.mismaDireccion) {

                nuevo.envio = {

                    ...nuevo.direccion,

                    mismaDireccion: true

                };

            }

            nuevo.responsable = anterior.responsable;

            localStorage.setItem(

                clave(usuario?.username || "anonimo"),

                JSON.stringify(nuevo)

            );

            return nuevo;

        },

        olvidar(usuario) {

            localStorage.removeItem(clave(usuario?.username || "anonimo"));

        }

    };

})();
