/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
|
| Avisos que se van solos, en lugar del `alert` del navegador.
|
| Un `alert` para el trabajo: hay que ir a pulsar Aceptar para
| poder seguir, y en una aplicación que avisa a menudo eso cansa.
| Un aviso que aparece, se lee y se va no interrumpe.
|
| Lleva `role="status"` cuando informa y `role="alert"` cuando
| algo ha ido mal: es la diferencia entre que un lector de
| pantalla lo lea cuando pueda o lo interrumpa todo para leerlo.
|
| Los de error duran más: son los que hay que leer entero.
|
*/

const Toast = (() => {

    const DURACION = {

        ok: 3000,

        error: 6000

    };

    function contenedor() {

        let caja =
            document.getElementById("avisos");

        if (!caja) {

            caja = document.createElement("div");

            caja.id = "avisos";

            caja.className = "avisos";

            document.body.appendChild(caja);

        }

        return caja;

    }

    return {

        mostrar(mensaje, tipo = "ok") {

            const aviso =
                document.createElement("div");

            aviso.className = `toast ${tipo}`;

            aviso.setAttribute(
                "role",
                tipo === "error" ? "alert" : "status"
            );

            aviso.textContent = mensaje;

            contenedor().appendChild(aviso);

            setTimeout(() => aviso.remove(), DURACION[tipo] || DURACION.ok);

        },

        error(mensaje) {

            this.mostrar(mensaje, "error");

        }

    };

})();
