/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
|
| La vuelta al menú principal desde cualquier grupo funcional.
|
| Es un botón y no un enlace a propósito. Un enlace lo sabe
| seguir cualquiera, incluido el Discovery; un botón que navega
| por JavaScript es como se mueven las aplicaciones de una sola
| página, y es justo lo que hoy no se sabe reconocer. El
| laboratorio existe para tener delante esos casos, no para
| esquivarlos.
|
| Se engancha solo: a la página le basta con incluir el fichero y
| poner el botón. Si no lo tiene, no pasa nada.
|
*/

const Navigation = (() => {

    const INICIO = "index.html";

    const BOTON = "homeButton";

    function create() {

        const boton =
            document.getElementById(BOTON);

        if (!boton) {

            return;

        }

        boton.addEventListener("click", () => {

            window.location.href = INICIO;

        });

    }

    document.addEventListener("DOMContentLoaded", create);

    return {

        INICIO,

        create

    };

})();
