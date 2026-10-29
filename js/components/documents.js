/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
|
| La pestaña de Documentación de la ficha de un registro: subir
| un fichero, verlo en la lista, descargarlo y borrarlo.
|
| Es el mismo componente en las cinco entidades, con su propio
| almacén **por registro**. Los documentos de una empresa son los
| suyos, no los de "Empresas": un contrato pertenece a un cliente
| concreto, y eso es lo que hace una aplicación de verdad.
|
| Empezó viviendo en el listado, con un almacén por módulo. Eso
| era un cajón común, y un cajón común no es documentación de
| nada.
|
| Los ficheros se guardan en el navegador, dentro del propio
| registro, como URL de datos. El laboratorio no tiene servidor
| —es HTML y JavaScript sobre localStorage— y no lo va a tener
| por esto: lo que la plataforma tiene que aprender a reconocer
| es el campo de fichero y el botón de descarga, no dónde acaba
| el byte.
|
| De ahí el tope de tamaño: localStorage son unos pocos megas
| para todo el laboratorio, y una URL de datos abulta un tercio
| más que el fichero.
|
*/

const Documents = (() => {

    const TOPE = 256 * 1024;

    const EJEMPLO = `Documento de ejemplo del CRM Laboratory.

Esta pestaña existe para que la plataforma se encuentre un campo
de subida de ficheros y una descarga, que es lo que hay en
cualquier aplicación empresarial.
`;

    function clave(modulo, registro) {

        return `qa-platform-docs-${modulo}-${registro}`;

    }

    /*
    * btoa no sabe de acentos: hay que pasar el texto a bytes
    * antes. Sin esto, la ñ del ejemplo lanzaría una excepción.
    */

    function urlDeTexto(texto) {

        const bytes =
            new TextEncoder().encode(texto);

        let binario = "";

        for (const byte of bytes) {

            binario += String.fromCharCode(byte);

        }

        return `data:text/plain;base64,${btoa(binario)}`;

    }

    function semilla(titulo) {

        return [{

            id: 1,

            name: `Ficha de ${titulo}.txt`,

            type: "text/plain",

            size: new TextEncoder().encode(EJEMPLO).length,

            addedAt: "2026-08-01T09:00:00.000Z",

            content: urlDeTexto(EJEMPLO)

        }];

    }

    function load(modulo, registro, titulo) {

        const guardados =
            localStorage.getItem(clave(modulo, registro));

        if (!guardados) {

            const iniciales =
                semilla(titulo);

            save(modulo, registro, iniciales);

            return iniciales;

        }

        return JSON.parse(guardados);

    }

    function save(modulo, registro, documentos) {

        localStorage.setItem(
            clave(modulo, registro),
            JSON.stringify(documentos)
        );

    }

    function tamano(bytes) {

        return bytes < 1024
            ? `${bytes} B`
            : `${(bytes / 1024).toFixed(1)} KB`;

    }

    function fecha(iso) {

        const cuando = new Date(iso);

        return [

            String(cuando.getDate()).padStart(2, "0"),

            String(cuando.getMonth() + 1).padStart(2, "0"),

            cuando.getFullYear()

        ].join("/");

    }

    function escapar(texto) {

        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function renderRow(documento) {

        return `

<tr data-id="${documento.id}">

    <td class="columna-tirador">
        ${typeof Orden !== "undefined" ? Orden.tirador("este documento") : ""}
    </td>

    <td>${escapar(documento.name)}</td>

    <td>${escapar(documento.type || "desconocido")}</td>

    <td>${tamano(documento.size)}</td>

    <td>${fecha(documento.addedAt)}</td>

    <td>

        <div class="action-buttons">

            <a
                class="btn-download"
                href="${documento.content}"
                download="${escapar(documento.name)}">
                ⬇ Descargar
            </a>

            <button
                class="btn-document-delete"
                data-id="${documento.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    function create({ modulo, registro, titulo }) {

        const tabla =
            document.getElementById("documentsGrid");

        const campo =
            document.getElementById("documentFile");

        const boton =
            document.getElementById("uploadDocumentButton");

        if (!tabla || !campo || !boton) {

            return;

        }

        const aviso =
            document.getElementById("documentAviso");

        let documentos =
            load(modulo, registro, titulo);

        function decir(mensaje, tipo = "ok") {

            if (!aviso) {

                return;

            }

            aviso.textContent = mensaje;

            aviso.className = `aviso ${tipo}`;

        }

        /*
        * Los documentos también se colocan a mano, como las filas
        * de cualquier otra lista. Su orden es de este registro y
        * no del módulo: los papeles de una empresa se ordenan
        * como quiera esa empresa.
        */

        const entidadDelOrden =
            `documentos-${modulo}-${registro}`;

        function render() {

            const ordenados =
                typeof Orden !== "undefined"
                    ? Orden.aplicar(entidadDelOrden, documentos)
                    : documentos;

            DataTable.render(
                "#documentsGrid tbody",
                ordenados.map(renderRow)
            );

            if (typeof Orden !== "undefined") {

                Orden.conectar({

                    contenedor:
                        tabla.querySelector("tbody"),

                    selector:
                        "tr",

                    idDe:
                        fila => fila.dataset.id,

                    alSoltar:
                        ids => {

                            Orden.colocar(
                                entidadDelOrden,
                                ids,
                                ordenados.map(d => d.id)
                            );

                            render();

                        }

                });

            }

            /*
            * Los botones se buscan dentro de esta tabla y no en
            * toda la página: el listado del módulo tiene los
            * suyos, y son otros.
            */

            tabla

                .querySelectorAll(".btn-document-delete")

                .forEach(button => {

                    button.onclick = async () => {

                        const documento =
                            documentos.find(
                                d => d.id == button.dataset.id
                            );

                        if (!documento) {

                            return;

                        }

                        const confirmado =
                            await Confirm.pedir({

                                titulo: "Eliminar documento",

                                texto:
                                    `¿Seguro que quieres eliminar "${documento.name}"?`,

                                aceptar: "Eliminar"

                            });

                        if (!confirmado) {

                            return;

                        }

                        documentos =
                            documentos.filter(d => d.id != documento.id);

                        save(modulo, registro, documentos);

                        render();

                        decir(`Documento "${documento.name}" eliminado.`);

                    };

                });

        }

        boton.addEventListener("click", () => {

            const fichero =
                campo.files?.[0];

            if (!fichero) {

                decir("Elige un fichero antes de subirlo.", "error");

                return;

            }

            /*
            | Y que sea de un tipo admitido
            |
            | El campo lo declara con `accept`, y `accept` **no impide
            | nada**: es una ayuda para el cuadro de elegir fichero. Quien
            | arrastre uno, o use una herramienta, entra igual — así que la
            | comprobación de verdad tiene que estar aquí.
            |
            | Se leen los tipos del propio campo y no de una lista escrita
            | dos veces: si mañana el campo admite otro, esto se entera solo.
            | Dos sitios diciendo qué se admite es un sitio de más donde
            | pueden dejar de coincidir.
            */

            const admitidos =
                (campo.getAttribute("accept") || "")
                    .split(",")
                    .map(uno => uno.trim().toLowerCase())
                    .filter(Boolean);

            const suExtension =
                "." + (fichero.name.split(".").pop() || "").toLowerCase();

            if (admitidos.length && !admitidos.includes(suExtension)) {

                decir(
                    `"${fichero.name}" no es de un tipo admitido. ` +
                    `Se admiten: ${admitidos.join(", ")}.`,
                    "error"
                );

                return;

            }

            if (fichero.size > TOPE) {

                decir(
                    `"${fichero.name}" pesa ${tamano(fichero.size)} y el tope es ${tamano(TOPE)}.`,
                    "error"
                );

                return;

            }

            const lector = new FileReader();

            lector.onload = () => {

                documentos = [

                    ...documentos,

                    {

                        id: Date.now(),

                        name: fichero.name,

                        type: fichero.type || "desconocido",

                        size: fichero.size,

                        addedAt: new Date().toISOString(),

                        content: lector.result

                    }

                ];

                save(modulo, registro, documentos);

                render();

                campo.value = "";

                decir(`Documento "${fichero.name}" subido.`);

            };

            lector.onerror = () => {

                decir(`No se ha podido leer "${fichero.name}".`, "error");

            };

            lector.readAsDataURL(fichero);

        });

        render();

    }

    return {

        TOPE,

        create

    };

})();
