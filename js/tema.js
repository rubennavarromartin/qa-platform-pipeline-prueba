/*
|--------------------------------------------------------------------------
| Tema
|--------------------------------------------------------------------------
|
| Claro u oscuro. De partida manda el sistema operativo; si
| alguien pulsa el interruptor, manda su elección y se recuerda.
|
| Este fichero se carga en la cabecera y sin defer a propósito:
| tiene que fijar el tema antes de que se pinte nada. Cargado al
| final, la página aparecería un instante en claro antes de
| ponerse oscura, que es el parpadeo más molesto que hay.
|
| El interruptor lo pinta el menú lateral, que aparece después
| que este fichero: por eso conectar() se vuelve a llamar desde
| Layout en cuanto el botón existe.
|
*/

const Tema = (() => {

    const PREFERENCIA = "crm.tema";

    const raiz =
        document.documentElement;

    const guardado =
        localStorage.getItem(PREFERENCIA);

    if (guardado === "claro" || guardado === "oscuro") {

        raiz.dataset.tema = guardado;

    }

    /*
    * El tema que se está viendo ahora mismo, venga de la
    * elección de quien usa la aplicación o del sistema.
    */

    function actual() {

        if (raiz.dataset.tema) {

            return raiz.dataset.tema;

        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "oscuro"
            : "claro";

    }

    function pintar(boton) {

        const oscuro =
            actual() === "oscuro";

        boton.textContent =
            oscuro ? "☀" : "☾";

        boton.setAttribute(
            "aria-label",
            oscuro
                ? "Cambiar al tema claro"
                : "Cambiar al tema oscuro"
        );

        boton.setAttribute(
            "title",
            boton.getAttribute("aria-label")
        );

    }

    function conectar() {

        const boton =
            document.getElementById("temaButton");

        if (!boton || boton.dataset.conectado) {

            return;

        }

        boton.dataset.conectado = "si";

        pintar(boton);

        boton.addEventListener("click", () => {

            const siguiente =
                actual() === "oscuro"
                    ? "claro"
                    : "oscuro";

            raiz.dataset.tema = siguiente;

            localStorage.setItem(PREFERENCIA, siguiente);

            pintar(boton);

        });

    }

    document.addEventListener("DOMContentLoaded", conectar);

    return {

        actual,

        conectar

    };

})();
