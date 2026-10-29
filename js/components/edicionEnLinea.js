/*
|--------------------------------------------------------------------------
| Editar dentro de la fila
|--------------------------------------------------------------------------
|
| Cambiar un dato sin abrir el formulario: se pulsa el lápiz de la celda, el
| valor se convierte en un campo, y se confirma o se cancela ahí mismo.
|
| Por qué está en el laboratorio
|
|   Es de las formas de editar más comunes en una aplicación de empresa y la
|   plataforma sólo sabe leer la otra —abrir un formulario o un diálogo—. El
|   caso se monta aquí para poder preguntarle qué ve, que es para lo que
|   existe este laboratorio.
|
|   Y no es un caso nuevo del todo, que es lo que lo hace interesante: la
|   plataforma **ya reconoce el lápiz en una ficha** —lo dice en sus trazas,
|   "9 campos, 6 con lápiz"— y lo que no sabe es que una **rejilla** puede
|   tener lo mismo. La pregunta no es "¿sabe qué es un lápiz?" sino "¿lo
|   busca donde no lo había buscado?".
|
| Cómo está montado, y por qué así
|
|   La celda enseña su valor y un botón sin texto con un lápiz. Al pulsarlo,
|   dentro de la **misma celda** aparece un campo con el valor de ahora y dos
|   botones: confirmar y cancelar. Enter confirma y Escape cancela, que es lo
|   que espera quien escribe con el teclado.
|
|   Se ha montado así a propósito para que se pueda reconocer **por lo que
|   hace**: se pulsa algo de la fila y aparece un campo donde antes había un
|   dato. Quien lo lea buscando la palabra "editar" acertará en castellano y
|   fallará en el idioma siguiente.
|
|   Sólo una celda a la vez. Con dos abiertas, confirmar una repinta la tabla
|   y se lleva por delante lo que estuviera escrito en la otra — y eso no es
|   un caso que plantear, es un fallo del laboratorio.
|
| Lo que **no** hace, y es a propósito
|
|   No valida. Si el campo se deja vacío, se guarda vacío: la validación es
|   cosa del formulario, y un obligatorio que se exige en un sitio y no en
|   otro es otro caso —bueno, por cierto— pero no éste.
|
*/

const EdicionEnLinea = (() => {

    /*
    * La celda que está abierta, para poder cerrarla al abrir otra.
    */

    let abierta = null;

    /*
    * El dato de una celda, listo para pintar dentro del `<td>`.
    *
    * `campo` es el nombre del dato en el registro, y `etiqueta` cómo se
    * llama para quien no ve la pantalla: el botón no lleva texto, así que
    * sin eso no se sabría de qué es el lápiz.
    */

    function celda({ id, campo, valor, etiqueta }) {

        return `
            <span class="valor-en-linea">${valor}</span>
            <button
                class="btn-editar-en-linea"
                data-id="${id}"
                data-campo="${campo}"
                data-etiqueta="${etiqueta}"
                aria-label="Editar ${etiqueta}">✏</button>
        `;

    }

    /*
    * Abrir la celda: el valor se va y en su sitio queda el campo.
    *
    * Se guarda lo que había —no lo que se ve, sino el valor de verdad— para
    * poder devolverlo si se cancela.
    */

    function abrir(boton, { leer, guardar }) {

        if (abierta) {

            cerrar(abierta);

        }

        const td =
            boton.closest("td");

        const id =
            Number(boton.dataset.id);

        const campo =
            boton.dataset.campo;

        const etiqueta =
            boton.dataset.etiqueta;

        const antes =
            leer(id, campo);

        const contenido =
            td.innerHTML;

        td.innerHTML = `
            <input
                type="text"
                class="campo-en-linea"
                value="${antes ?? ""}"
                aria-label="${etiqueta}">
            <button class="btn-confirmar-en-linea" aria-label="Confirmar ${etiqueta}">✓</button>
            <button class="btn-cancelar-en-linea" aria-label="Cancelar ${etiqueta}">✗</button>
        `;

        const campoDeTexto =
            td.querySelector(".campo-en-linea");

        campoDeTexto.focus();

        campoDeTexto.select();

        abierta = { td, contenido };

        const confirmar = () => {

            const ahora =
                campoDeTexto.value;

            abierta = null;

            guardar(id, campo, ahora);

        };

        const cancelar = () => {

            cerrar({ td, contenido });

            abierta = null;

        };

        td.querySelector(".btn-confirmar-en-linea").onclick = confirmar;

        td.querySelector(".btn-cancelar-en-linea").onclick = cancelar;

        campoDeTexto.onkeydown = evento => {

            if (evento.key === "Enter") {

                evento.preventDefault();

                confirmar();

            }

            if (evento.key === "Escape") {

                evento.preventDefault();

                cancelar();

            }

        };

    }

    function cerrar({ td, contenido }) {

        td.innerHTML = contenido;

    }

    /*
    * Engancha una tabla entera.
    *
    * Se delega en la tabla en lugar de enganchar cada lápiz: la tabla se
    * repinta con cada cambio, y un manejador por nodo se pierde en cuanto
    * eso pasa — o peor, se acumula.
    */

    function enganchar(selectorDeLaTabla, { leer, guardar }) {

        const tabla =
            document.querySelector(selectorDeLaTabla);

        if (!tabla || tabla.dataset.edicionEnLinea === "sí") {

            return;

        }

        tabla.dataset.edicionEnLinea = "sí";

        tabla.addEventListener("click", evento => {

            const boton =
                evento.target.closest(".btn-editar-en-linea");

            if (boton && tabla.contains(boton)) {

                abrir(boton, { leer, guardar });

            }

        });

    }

    return {

        celda,

        enganchar

    };

})();
