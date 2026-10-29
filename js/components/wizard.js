/*
|--------------------------------------------------------------------------
| Wizard
|--------------------------------------------------------------------------
|
| El formulario de alta partido en pasos.
|
| Casi ningún alta de una aplicación empresarial pide todo de una
| vez: primero lo imprescindible, después el resto. Los campos
| del paso que no toca siguen en la página, pero escondidos.
|
| El diálogo pone los pasos —un `fieldset.paso` cada uno— y los
| cuatro botones; de enseñar el que toca y de cambiar los botones
| se ocupa esto.
|
| No valida al avanzar a propósito. La validación por paso es
| otro componente y merece su turno: si se metiera aquí, no se
| sabría si un fallo viene de los pasos o de la validación.
|
*/

const Wizard = (() => {

    function create() {

        const pasos =
            [...document.querySelectorAll(".modal .paso")];

        if (pasos.length < 2) {

            return;

        }

        const atras =
            document.getElementById("backButton");

        const siguiente =
            document.getElementById("nextButton");

        const guardar =
            document.getElementById("saveButton");

        const marcas =
            [...document.querySelectorAll(".modal .pasos li")];

        let actual = 0;

        function mostrar() {

            pasos.forEach((paso, i) => {

                paso.hidden = i !== actual;

            });

            marcas.forEach((marca, i) => {

                if (i === actual) {

                    marca.setAttribute("aria-current", "step");

                }
                else {

                    marca.removeAttribute("aria-current");

                }

            });

            const ultimo =
                actual === pasos.length - 1;

            if (atras) {

                atras.hidden = actual === 0;

            }

            if (siguiente) {

                siguiente.hidden = ultimo;

            }

            if (guardar) {

                guardar.hidden = !ultimo;

            }

            /*
            * El foco va al primer campo del paso que se acaba de
            * enseñar. Si no, quien navega con el teclado se queda
            * donde estaba el botón que ya no existe.
            */

            pasos[actual]
                .querySelector("input,select,textarea")
                ?.focus();

        }

        if (siguiente) {

            siguiente.addEventListener("click", () => {

                if (actual < pasos.length - 1) {

                    actual++;

                    mostrar();

                }

            });

        }

        if (atras) {

            atras.addEventListener("click", () => {

                if (actual > 0) {

                    actual--;

                    mostrar();

                }

            });

        }

        mostrar();

    }

    return {

        create

    };

})();
