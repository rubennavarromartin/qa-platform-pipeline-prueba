/*
|--------------------------------------------------------------------------
| El mockup
|--------------------------------------------------------------------------
|
| Lo justo para que los fallos de `mockup.html` sean fallos de verdad y no
| pantallas muertas. Dos comportamientos, y los dos están **mal a
| propósito**:
|
|   guardar    acepta el formulario aunque el campo obligatorio esté vacío
|   buscar     filtra la tabla y, cuando no queda nada, no dice nada
|
| Está escrito así de corto porque no es una pantalla del CRM: es un caso de
| prueba. Todo lo que se le añada de más lo aleja de ser lo que tiene que
| ser — una pantalla rota, pequeña y estable.
|
| Y estable importa: el laboratorio hace de guardián, y una pantalla que se
| comporte distinto entre dos Builds haría que el guardián dijera que la
| lectura cambió cuando lo que cambió fue esto.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    /*
    * FALLO 5. Se guarda sin comprobar nada, aunque el campo esté declarado
    * obligatorio. La prueba `OBLIGATORIO` tiene que cazarlo.
    */

    const guardar =
        document.getElementById("guardarMockup");

    if (guardar) {

        guardar.addEventListener("click", () => {

            const donde =
                document.getElementById("loQuePasa");

            if (donde) {

                donde.textContent = "Guardado.";

                donde.className = "status ok";

            }

        });

    }

    /*
    * FALLO 7. Filtra de verdad —para que se reconozca como buscador— y al
    * quedarse sin filas no dice nada: ni una fila que lo explique, ni un
    * aviso. La tabla se queda en blanco.
    *
    * Y filtra **la tabla sin cabecera**, que es la única que hay. Antes
    * había dos y filtraba la otra: el Discovery elegía como rejilla la sin
    * cabecera, el buscador vaciaba la de al lado, y al buscar algo que no
    * existe la rejilla elegida seguía con sus tres filas. El fallo era del
    * mockup, no de la plataforma.
    *
    * Se esconde también la fila que hace de cabecera. En una aplicación de
    * verdad la cabecera se quedaría, pero aquí no es una cabecera: es una
    * fila en negrita, y dejarla visible haría que la tabla no llegara nunca
    * a estar vacía.
    */

    const buscador =
        document.getElementById("buscadorMudo");

    const cuerpo =
        document.getElementById("cuerpoMudo");

    if (buscador && cuerpo) {

        const todas =
            [...cuerpo.querySelectorAll("tr")];

        buscador.addEventListener("input", () => {

            const busca =
                buscador.value.trim().toLowerCase();

            for (const fila of todas) {

                fila.hidden =
                    Boolean(busca) &&
                    !fila.innerText.toLowerCase().includes(busca);

            }

        });

    }

});
