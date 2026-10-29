/*
|--------------------------------------------------------------------------
| Ayuda
|--------------------------------------------------------------------------
|
| Los dos manuales, cada uno en su pestaña.
|
| Llegan con `fetch` desde `docs/` y no están escritos en el HTML, y es a
| propósito por dos motivos. Uno práctico: un manual dentro de una etiqueta
| no se puede leer con comodidad ni editar sin miedo. Y otro que es la razón
| de que este laboratorio exista: **una pantalla cuyo contenido llega
| después** es un caso que hay que plantear. Quien la mire demasiado pronto
| verá dos paneles vacíos.
|
| Se pide al abrir cada pestaña y no las dos al cargar: el segundo manual lo
| abre poca gente, y pedirlo siempre sería pedirlo para nada.
|
| El Markdown se convierte a mano, con las seis cosas que usan estos dos
| ficheros: encabezados, listas, tablas, código, citas y negrita. Este
| laboratorio no tiene ni una dependencia y no va a empezar por aquí — es
| HTML y JavaScript, como la aplicación que finge ser.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const barra =
        document.querySelector("[role='tablist']");

    if (!barra) {

        return;

    }

    /*
    * Lo ya pedido. Cambiar de pestaña dos veces no vuelve a pedirlo: es un
    * fichero que no cambia mientras la pantalla está abierta.
    */

    const leidos = new Set();

    const SALTO = String.fromCharCode(10);

    const RETORNO = String.fromCharCode(13);

    function escapar(texto) {

        return String(texto === null || texto === undefined ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    /*
    * De Markdown a HTML.
    *
    * Se escapa antes de convertir. El fichero es nuestro, así que no viene
    * de nadie de fuera; se escapa igual, porque el día que un manual
    * explique una etiqueta acabaría con un ejemplo dentro.
    *
    * Y se quitan los retornos de carro antes de partir. Los ficheros de este
    * laboratorio van con CRLF —es su convención— y partir sólo por el salto
    * deja un retorno al final de cada línea: con él, un punto de lista deja
    * de reconocerse y se pinta como un párrafo con un guión delante. Costaba
    * encontrarlo porque el texto se ve exactamente igual.
    *
    * Un párrafo y un punto de lista se acumulan y se escriben cuando están
    * completos, no línea a línea. Una negrita que empiece en una línea y
    * acabe en la siguiente quedaba partida en dos trozos y se veía con sus
    * asteriscos.
    */

    function deMarkdown(texto) {

        const bloques = [];

        const limpio =
            escapar(texto).split(RETORNO).join("");

        const sinCodigo =
            limpio.replace(/```[a-z]*\n([\s\S]*?)```/g, (todo, dentro) => {

                bloques.push(dentro.replace(/\n$/, ""));

                return "QAxBLOQUEx" + (bloques.length - 1);

            });

        const salida = [];

        /*
        * Lo que se está juntando y de qué es: un párrafo o un punto de una
        * lista. Se cierra al llegar a una línea vacía o a otra cosa.
        */

        let juntando = [];

        let deQue = null;

        let enLista = null;

        let enTabla = false;

        const enLinea =
            linea => linea

                .replace(/`([^`]+)`/g, "<code>$1</code>")

                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

        const cerrarJuntado = () => {

            if (!juntando.length) {

                return;

            }

            const dentro =
                enLinea(juntando.join(" "));

            salida.push(
                deQue === "punto"
                    ? "<li>" + dentro + "</li>"
                    : "<p>" + dentro + "</p>"
            );

            juntando = [];

            deQue = null;

        };

        /*
        * Cada cerrador cierra lo suyo. Y todos cierran antes lo que se
        * estuviera juntando, porque un punto abierto no puede quedarse
        * fuera de su lista.
        */

        const cerrarLista = () => {

            cerrarJuntado();

            if (enLista) {

                salida.push("</" + enLista + ">");

                enLista = null;

            }

        };

        const cerrarTabla = () => {

            if (enTabla) {

                salida.push("</tbody></table>");

                enTabla = false;

            }

        };

        for (const cruda of sinCodigo.split(SALTO)) {

            const linea =
                cruda.trim();

            const marca =
                linea.match(/^QAxBLOQUEx(\d+)$/);

            if (marca) {

                cerrarLista();
                cerrarTabla();

                salida.push(
                    "<pre><code>" + bloques[Number(marca[1])] + "</code></pre>"
                );

                continue;

            }

            if (/^\|/.test(linea)) {

                cerrarLista();

                const celdas =
                    linea.split("|").slice(1, -1).map(una => una.trim());

                if (celdas.every(una => /^[-: ]*$/.test(una))) {

                    salida.push("<tbody>");

                    enTabla = true;

                    continue;

                }

                if (!enTabla) {

                    salida.push("<table><thead>");

                    salida.push(
                        "<tr>" +
                        celdas.map(una => "<th>" + enLinea(una) + "</th>").join("") +
                        "</tr>"
                    );

                    salida.push("</thead>");

                    continue;

                }

                salida.push(
                    "<tr>" +
                    celdas.map(una => "<td>" + enLinea(una) + "</td>").join("") +
                    "</tr>"
                );

                continue;

            }

            cerrarTabla();

            const encabezado =
                linea.match(/^(#{1,4})\s+(.*)$/);

            if (encabezado) {

                cerrarLista();

                const nivel =
                    encabezado[1].length;

                salida.push(
                    "<h" + nivel + ">" + enLinea(encabezado[2]) + "</h" + nivel + ">"
                );

                continue;

            }

            if (/^&gt;\s?/.test(linea)) {

                cerrarLista();

                salida.push(
                    "<blockquote><p>" +
                    enLinea(linea.replace(/^&gt;\s?/, "")) +
                    "</p></blockquote>"
                );

                continue;

            }

            const punto =
                linea.match(/^-\s+(.*)$/);

            const numerado =
                linea.match(/^\d+\.\s+(.*)$/);

            if (punto || numerado) {

                cerrarJuntado();

                const cual =
                    punto ? "ul" : "ol";

                if (enLista !== cual) {

                    cerrarLista();

                    salida.push("<" + cual + ">");

                    enLista = cual;

                }

                juntando = [(punto || numerado)[1]];

                deQue = "punto";

                continue;

            }

            if (!linea) {

                cerrarLista();

                continue;

            }

            /*
            * Una línea con texto sigue lo que se estuviera juntando: la
            * continuación de un punto de lista o la del párrafo.
            */

            if (!juntando.length) {

                deQue = "parrafo";

            }

            juntando.push(linea);

        }

        cerrarLista();
        cerrarTabla();

        return salida.join(SALTO);

    }

    async function pedirElManual(elPanel) {

        const cual =
            elPanel && elPanel.dataset.manual;

        if (!cual || leidos.has(cual)) {

            return;

        }

        /*
        * El manual va dentro del `article` del panel, no en el panel: el
        * panel es de su pestaña y el artículo es el texto.
        */

        const panel =
            elPanel.querySelector("article") || elPanel;

        panel.innerHTML = '<p class="ayuda">Leyendo el manual...</p>';

        try {

            const respuesta =
                await fetch("docs/" + cual + ".md");

            if (!respuesta.ok) {

                throw new Error("El servidor contesta " + respuesta.status);

            }

            panel.innerHTML =
                deMarkdown(await respuesta.text());

            leidos.add(cual);

        }
        catch (error) {

            /*
            * Y se dice dónde vive, que es lo único que se puede hacer al
            * respecto.
            */

            panel.innerHTML =
                '<p class="aviso">No se ha podido leer el manual: ' +
                escapar(error.message) +
                '. Vive en <code>docs/' + escapar(cual) + '.md</code>.</p>';

        }

    }

    /*
    * El primero al cargar, y cada uno cuando se abre su pestaña.
    *
    * El componente de pestañas avisa con un evento `pestana` justo para
    * esto: lo que vive dentro de un panel puede necesitar algo al enseñarse,
    * y no tiene por qué enterarse preguntando. Va en `document` y su detalle
    * lleva el **id** del panel, no el nodo.
    */

    document.addEventListener("pestana", evento => {

        pedirElManual(
            document.getElementById(evento.detail && evento.detail.panel)
        );

    });

    pedirElManual(
        document.getElementById("ayudaPanelUsuario")
    );

});
