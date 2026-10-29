/*
|--------------------------------------------------------------------------
| Acceso
|--------------------------------------------------------------------------
|
| Identificarse contra la lista de Usuarios de la propia
| aplicación.
|
| No hay servidor detrás: el laboratorio es HTML y JavaScript
| sobre localStorage, y la comprobación se hace aquí. No pretende
| ser seguro —la contraseña está escrita en la pantalla— y no
| tiene por qué serlo: lo que se prueba es que la plataforma sepa
| entrar, no que nadie pueda colarse.
|
| La sesión va en localStorage y no en sessionStorage a
| propósito: Playwright guarda y restaura cookies y localStorage,
| pero no sessionStorage. Si fuera de sesión, la plataforma
| entraría una vez y las pruebas seguirían encontrándose la
| pantalla de acceso.
|
*/

(function () {

    /*
    * A dónde se va después de entrar.
    *
    * Era Inicio para todos, y dejó de valer con el rol que sólo ve
    * Proyectos: a ése, Inicio le contesta que no tiene permiso, y empezar
    * así una sesión es de las cosas que sólo se descubren usando la
    * aplicación. Lo decide `Permissions`, que es quien sabe qué pantallas ve
    * cada uno; si no está cargado, Inicio, que es lo de siempre.
    */

    function aDondeVa() {

        return typeof Permissions !== "undefined"
            ? Permissions.primeraPantalla()
            : "index.html";

    }

    const formulario =
        document.getElementById("loginForm");

    const boton =
        document.getElementById("loginButton");

    const error =
        document.getElementById("loginError");

    /*
    * Quien ya ha entrado no tiene que volver a hacerlo. Se usa
    * replace y no href para no dejar el acceso en el historial:
    * volver atrás lo enseñaría otra vez.
    */

    if (Session.abierta()) {

        window.location.replace(aDondeVa());

        return;

    }

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        error.textContent = "";

        boton.disabled = true;

        const entrado =
            Session.entrar(
                document.getElementById("username").value,
                document.getElementById("password").value
            );

        boton.disabled = false;

        if (!entrado) {

            error.textContent =
                "Usuario o contraseña incorrectos.";

            const clave =
                document.getElementById("password");

            clave.value = "";

            clave.focus();

            return;

        }

        window.location.href = aDondeVa();

    });

})();
