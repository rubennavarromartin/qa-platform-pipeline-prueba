/*
|--------------------------------------------------------------------------
| Session
|--------------------------------------------------------------------------
|
| Quién ha entrado en el laboratorio.
|
| Antes esto no pedía identificarse: cogía el primer usuario del
| módulo de Usuarios para poder firmar los comentarios. Ahora hay
| pantalla de acceso, y la sesión es de verdad: se entra con un
| usuario y una contraseña de la lista de Usuarios, y de ahí
| salen el nombre que firma y el rol que manda sobre los
| permisos.
|
| No pretende ser seguro. La contraseña se guarda en claro junto
| al usuario y se compara aquí, en el navegador: esto es un banco
| de pruebas y lo que se prueba es que la plataforma sepa entrar,
| no que nadie pueda colarse.
|
| La sesión va en localStorage y no en sessionStorage a
| propósito: Playwright guarda y restaura cookies y localStorage,
| pero no sessionStorage. Si fuera de sesión, la plataforma
| entraría una vez y las pruebas seguirían encontrándose la
| pantalla de acceso.
|
*/

const Session = (() => {

    const STORAGE_KEY = "qa-platform-sesion";

    const ACCESO = "login.html";

    /*
    * Se admite entrar con el usuario o con el correo. Un CRM
    * real admite las dos cosas, y aquí además evita la duda de
    * si el usuario de "Rubén Navarro" es "ruben" o su correo.
    */

    function buscar(quien) {

        if (typeof Users === "undefined") {

            return null;

        }

        Users.load?.();

        const buscado =
            String(quien || "").trim().toLowerCase();

        return Users.findAll().find(usuario =>

            String(usuario.username || "").toLowerCase() === buscado ||
            String(usuario.email || "").toLowerCase() === buscado

        ) || null;

    }

    function guardada() {

        try {

            return JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

        }
        catch {

            return null;

        }

    }

    return {

        ACCESO,

        entrar(quien, contrasena) {

            const usuario =
                buscar(quien);

            if (!usuario || usuario.password !== contrasena) {

                return false;

            }

            /*
            * Un usuario dado de baja no entra. Es la primera vez
            * que el estado de un registro decide algo en lugar de
            * pintarse en una etiqueta de color.
            */

            if (usuario.status && usuario.status !== "Activo") {

                return false;

            }

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify({

                    id: usuario.id,

                    username: usuario.username,

                    name: usuario.name,

                    role: usuario.role,

                    desde: new Date().toISOString()

                })

            );

            return true;

        },

        abierta() {

            return Boolean(guardada());

        },

        /*
        * La sesión entera: quién es y qué rol tiene.
        *
        * El rol se relee de la ficha del usuario y no se cree el
        * de la sesión: si a alguien le cambian el rol mientras
        * está dentro, tiene que notarlo sin volver a entrar.
        */

        actual() {

            const sesion =
                guardada();

            if (!sesion) {

                return null;

            }

            const usuario =
                buscar(sesion.username);

            return {

                ...sesion,

                role:
                    usuario ? usuario.role : sesion.role

            };

        },

        /*
        * El nombre de quien firma. Sin sesión abierta cae al
        * primer usuario, que es lo que hacía antes: así una
        * pantalla suelta abierta sin acceso sigue funcionando.
        */

        usuario() {

            const sesion =
                guardada();

            if (sesion?.name) {

                return sesion.name;

            }

            if (typeof Users !== "undefined") {

                Users.load?.();

                return Users.findAll()[0]?.name || "";

            }

            return "";

        },

        salir() {

            localStorage.removeItem(STORAGE_KEY);

        },

        /*
        * Se llama al principio de cada pantalla protegida. Se usa
        * replace y no href para no dejar la pantalla en el
        * historial: si no, volver atrás la enseñaría otra vez.
        */

        exigir() {

            if (this.abierta()) {

                return true;

            }

            window.location.replace(ACCESO);

            return false;

        }

    };

})();
