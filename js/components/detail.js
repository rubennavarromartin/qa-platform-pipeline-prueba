/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
|
| La ficha de un registro, con dirección propia:
|
|     contacts.html?id=2
|
| Es el mismo componente en las cinco pantallas. Cada módulo dice
| tres cosas —de dónde saca el registro, cómo se titula y qué
| datos enseña— y de lo demás se ocupa esto: leer la dirección,
| cambiar del listado a la ficha, pintar los datos y avisar
| cuando el identificador no lleva a ninguna parte.
|
| Con la ficha en la dirección, "este registro" significa algo:
| sobrevive a la recarga y se puede pasar a alguien. Antes
| dependía de la fila que se hubiera pulsado.
|
| El listado y la ficha viven en el mismo fichero y la dirección
| decide cuál se ve. Podrían ser dos ficheros; se hace así porque
| es lo que obliga a distinguir "otra pantalla" de "la misma
| pantalla con otro registro", que es lo que interesa tener
| delante.
|
*/

const Detail = (() => {

    const PARAMETRO = "id";

    /*
    * La ficha que se está enseñando, para poder repintarla
    * después de editar.
    */

    let activa = null;

    function idPedido() {

        const valor =
            new URLSearchParams(window.location.search)
                .get(PARAMETRO);

        return valor === null || valor === ""
            ? null
            : valor;

    }

    function fila([etiqueta, valor]) {

        return `
    <dt>${etiqueta}</dt>
    <dd>${valor ?? ""}</dd>`;

    }

    /*
    * El aviso no dice "Empresa no encontrada" ni "Contacto no
    * encontrado": cada entidad tiene su género y el componente
    * es el mismo para todas. "Registro" vale para las cinco.
    */

    function noExiste(id, entidad) {

        document.getElementById("fichaTitulo").textContent =
            "No encontrado";

        const aviso =
            document.getElementById("fichaNoExiste");

        aviso.textContent =
            `No hay ningún registro de ${entidad} con el identificador ${id}.`;

        aviso.hidden = false;

        /*
        * Sin registro no hay nada que enseñar: fuera las
        * pestañas y sus paneles. Dejarlos vacíos parecería que
        * el registro existe y está en blanco.
        */

        document
            .querySelectorAll("#vistaFicha [role='tab'],#vistaFicha [role='tabpanel']")
            .forEach(nodo => { nodo.hidden = true; });

    }

    /*
    |--------------------------------------------------------------------------
    | Ir al anterior y al siguiente
    |--------------------------------------------------------------------------
    |
    | Estando en una ficha, moverse a la de al lado sin volver al
    | listado. Es lo que tiene cualquier aplicación de gestión, y
    | lo que hace que revisar catorce registros sea recorrerlos y
    | no entrar y salir catorce veces.
    |
    | El orden es el de la lista: el que se haya dejado
    | arrastrando las filas, si hay alguno. "El siguiente" tiene
    | que ser el que se ve debajo, no el que tenga el
    | identificador de después.
    |
    | En los extremos el botón se apaga en lugar de esconderse: un
    | botón que aparece y desaparece mueve los de al lado, y se
    | acaba pulsando el que no era.
    |
    */

    function vecinos(config, id) {

        const registros =
            typeof Orden !== "undefined"
                ? Orden.aplicar(claveDeOrden(), config.repositorio.findAll())
                : config.repositorio.findAll();

        const donde =
            registros.findIndex(r => String(r.id) === String(id));

        return {

            anterior:
                donde > 0 ? registros[donde - 1] : null,

            siguiente:
                donde >= 0 && donde < registros.length - 1
                    ? registros[donde + 1]
                    : null,

            posicion:
                donde + 1,

            cuantos:
                registros.length

        };

    }

    /*
    * Con qué clave se guardó el orden de esta lista.
    *
    * Es el nombre de la pantalla sin extensión —companies,
    * contacts, agenda...—, que es exactamente lo que cada listado
    * declara como entidad. Se saca de la dirección en lugar de
    * pedírselo a cada ficha porque una pantalla es un módulo: el
    * día que dejen de coincidir habrá que pasarlo, y se notará
    * porque el orden dejará de seguirse.
    */

    function claveDeOrden() {

        return window.location.pathname
            .split("/")
            .pop()
            .replace(/\.html$/, "");

    }

    function pintarPaso(config, id) {

        const migas =
            document.querySelector("#vistaFicha .migas");

        if (!migas) {

            return;

        }

        const { anterior, siguiente, posicion, cuantos } =
            vecinos(config, id);

        const pagina =
            window.location.pathname.split("/").pop();

        const paso =
            document.createElement("div");

        paso.className = "fichaPaso";

        paso.innerHTML = `

            <button
                id="fichaAnterior"
                class="btn-secondary"
                type="button"
                ${anterior ? "" : "disabled"}
                title="Ir al registro anterior">
                ‹ Anterior
            </button>

            <span class="fichaPosicion" role="status">
                ${posicion} de ${cuantos}
            </span>

            <button
                id="fichaSiguiente"
                class="btn-secondary"
                type="button"
                ${siguiente ? "" : "disabled"}
                title="Ir al registro siguiente">
                Siguiente ›
            </button>`;

        migas.appendChild(paso);

        const ir =
            registro => {

                window.location.href = `${pagina}?id=${registro.id}`;

            };

        if (anterior) {

            paso.querySelector("#fichaAnterior")
                .addEventListener("click", () => ir(anterior));

        }

        if (siguiente) {

            paso.querySelector("#fichaSiguiente")
                .addEventListener("click", () => ir(siguiente));

        }

    }

    function pintar(config, registro) {

        const titulo =
            config.titulo(registro);

        document.title =
            `${titulo} — ${config.entidad}`;

        document.getElementById("fichaTitulo").textContent =
            titulo;

        document.getElementById("fichaDatos").innerHTML =
            config.datos(registro).map(fila).join("");

        config.alCargar?.(registro);

    }

    /*
    * Al cerrarse un diálogo, la ficha se repinta: si se ha
    * editado, lo que hay en pantalla ya no es lo que hay
    * guardado.
    */

    document.addEventListener("modal-cerrado", () => {

        if (!activa) {

            return;

        }

        const registro =
            activa.repositorio.findById(idPedido());

        if (registro) {

            pintar(activa, registro);

        }

    });

    return {

        /*
        * ¿Toca ficha o listado? Lo decide la dirección, y hace
        * falta saberlo antes de montar cualquiera de las dos.
        */

        pedida() {

            return idPedido() !== null;

        },

        /*
        * config:
        *
        *   entidad       cómo se llama un registro, para los
        *                 avisos: "Empresa", "Contacto"...
        *   repositorio   de dónde sale
        *   titulo        (registro) -> el encabezado de la ficha
        *   datos         (registro) -> [[etiqueta, valor], ...]
        *   alCargar      (registro) -> lo que cada módulo quiera
        *                 hacer con su ficha: llenar la pestaña de
        *                 los registros relacionados, normalmente.
        */

        create(config) {

            /*
            * Se guarda la configuración para poder repintar la
            * ficha cuando se edite: los datos cambian y lo que
            * hay en pantalla se queda viejo.
            */

            activa = config;

            const id =
                idPedido();

            document.getElementById("vistaListado").hidden = true;

            document.getElementById("vistaFicha").hidden = false;

            document
                .getElementById("fichaHomeButton")
                ?.addEventListener("click", () => {

                    window.location.href = Navigation.INICIO;

                });

            config.repositorio.load();

            const registro =
                config.repositorio.findById(id);

            if (!registro) {

                noExiste(id, config.entidad);

                return null;

            }

            pintar(config, registro);

            pintarPaso(config, id);

            /*
            * Editar se hace desde aquí y no desde el listado.
            * Una fila con un botón por columna es una barra de
            * herramientas disfrazada; la ficha es el sitio donde
            * se ve el registro entero, y por tanto donde tiene
            * sentido cambiarlo.
            */

            const editar =
                document.getElementById("fichaEditarButton");

            if (editar && config.editar) {

                editar.hidden = false;

                editar.addEventListener("click", () => {

                    config.editar(
                        config.repositorio.findById(id)
                    );

                });

            }

            return registro;

        },

        /*
        * Un valor de la ficha que lleva a la ficha de otro
        * registro. Es lo que hace que una relación se pueda
        * recorrer y no sólo leer.
        */

        enlace(pagina, id, texto) {

            return id === null || id === undefined
                ? (texto || "")
                : `<a class="ficha" href="${pagina}?id=${id}">${texto}</a>`;

        }

    };

})();
