/*
|--------------------------------------------------------------------------
| Mi perfil
|--------------------------------------------------------------------------
|
| La pantalla del perfil: pintar lo guardado, abrir un campo
| cuando se pulsa su lápiz, y guardar cada sección por su cuenta.
|
| No usa CrudPage ni Detail: aquí no hay listado del que venir ni
| identificador en la dirección. Es el registro de quien ha
| entrado, y no hay otro.
|
| Las tres reglas que hacen que esta pantalla plantee algo:
|
|   Un campo editable empieza cerrado. Escribir en él sin haber
|   pulsado el lápiz no es posible, y por tanto tampoco lo es
|   guardarlo.
|
|   Un campo bloqueado no se abre nunca, no tiene lápiz, y al
|   guardar se repone con lo que había. Quitarle el `readonly`
|   desde fuera no sirve de nada.
|
|   La casilla de "usar la misma dirección" manda sobre los cinco
|   campos de envío: marcada, se apagan y valen los de arriba.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const campo =
        id => document.getElementById(id);

    const usuario =
        typeof Session !== "undefined"
            ? Session.actual()
            : null;

    if (!campo("profileId")) {

        return;

    }

    /*
    * Qué campo de la pantalla es qué dato del perfil.
    *
    * En un sitio y no repartido por el código: los mismos pares
    * sirven para pintar y para leer, y así no puede haber un
    * campo que se pinte de un sitio y se guarde en otro.
    */

    const PERSONALES = {

        profileId: "id",
        profileName: "nombre",
        profileSurname: "apellidos",
        profilePhone: "telefono",
        profileWorkPhone: "telefonoCorporativo",
        profileEmail: "email",
        profileWorkEmail: "emailCorporativo",
        profileAccount: "cuenta",
        profileSwift: "swift"

    };

    const PUESTO = {

        profileCategory: "categoria",
        profileOffice: "oficina",
        profileHours: "horas",
        profileHired: "alta",
        profileAgreement: "convenio"

    };

    const DIRECCION = {

        profileCity: "ciudad",
        profileRegion: "region",
        profileCountry: "pais",
        profilePostalCode: "codigoPostal",
        profileStreet: "calle"

    };

    const ENVIO = {

        shippingCity: "ciudad",
        shippingRegion: "region",
        shippingCountry: "pais",
        shippingPostalCode: "codigoPostal",
        shippingStreet: "calle"

    };

    function opciones(select, valores, elegido) {

        select.innerHTML =
            valores

                .map(valor => `
                    <option ${valor === elegido ? "selected" : ""}>
                        ${valor}
                    </option>`)

                .join("");

    }

    function pintar(perfil) {

        campo("profileWho").textContent =
            `${perfil.nombre} ${perfil.apellidos} · ${perfil.categoria}`;

        for (const [id, dato] of Object.entries(PERSONALES)) {

            campo(id).value = perfil[dato] ?? "";

        }

        opciones(campo("profileOffice"), Profile.OFICINAS, perfil.oficina);

        campo("profileCategory").value = perfil.categoria ?? "";

        campo("profileHours").value = perfil.horas ?? "";

        campo("profileHired").value = perfil.alta ?? "";

        campo("profileAgreement").value = perfil.convenio ?? "";

        opciones(campo("profileCity"), Profile.CIUDADES, perfil.direccion.ciudad);

        for (const [id, dato] of Object.entries(DIRECCION)) {

            if (id !== "profileCity") {

                campo(id).value = perfil.direccion[dato] ?? "";

            }

        }

        opciones(campo("shippingCity"), Profile.CIUDADES, perfil.envio.ciudad);

        for (const [id, dato] of Object.entries(ENVIO)) {

            if (id !== "shippingCity") {

                campo(id).value = perfil.envio[dato] ?? "";

            }

        }

        campo("shippingSame").checked =
            Boolean(perfil.envio.mismaDireccion);

        pintarResponsable(perfil.responsable);

        aplicarMismaDireccion();

    }

    /*
    * El responsable no es un campo: es un dato que apunta a otro
    * registro. Se enseña como la ficha de cualquier entidad, con
    * el nombre llevando a su ficha de usuario.
    */

    function pintarResponsable(responsable) {

        const enlace =
            typeof Detail !== "undefined"
                ? Detail.enlace("users.html", responsable?.id ?? null, responsable?.nombre || "")
                : (responsable?.nombre || "");

        campo("profileManager").innerHTML = `
            <dt>Nombre y apellidos</dt>
            <dd>${enlace}</dd>
            <dt>Email corporativo</dt>
            <dd>${responsable?.email || ""}</dd>`;

    }

    /*
    |----------------------------------------------------------
    | Abrir un campo
    |----------------------------------------------------------
    |
    | El lápiz quita el `readonly` —o el `disabled`, si es un
    | desplegable— y lleva el foco al campo. No guarda nada: eso
    | sigue siendo del botón de la sección.
    */

    function abrir(id) {

        const nodo =
            campo(id);

        if (!nodo) {

            return;

        }

        if (nodo.tagName === "SELECT") {

            nodo.disabled = false;

        }
        else {

            nodo.readOnly = false;

        }

        nodo.classList.add("abierto");

        nodo.focus();

    }

    document

        .querySelectorAll(".lapiz[data-abre]")

        .forEach(boton => {

            boton.addEventListener("click", () => abrir(boton.dataset.abre));

        });

    /*
    |----------------------------------------------------------
    | La casilla que manda sobre la sección de al lado
    |----------------------------------------------------------
    |
    | Marcada, los cinco campos del envío se apagan y se pintan
    | con los de arriba: la dirección de envío es la otra. Al
    | desmarcarla se quedan como estaban y se pueden abrir.
    */

    function aplicarMismaDireccion() {

        const misma =
            campo("shippingSame").checked;

        for (const [id, dato] of Object.entries(ENVIO)) {

            const nodo =
                campo(id);

            if (misma) {

                const deArriba =
                    Object.entries(DIRECCION)
                        .find(([, cual]) => cual === dato)?.[0];

                nodo.value = campo(deArriba).value;

            }

            if (nodo.tagName === "SELECT") {

                nodo.disabled = misma || !nodo.classList.contains("abierto");

            }
            else {

                nodo.readOnly = misma || !nodo.classList.contains("abierto");

            }

            nodo.classList.toggle("apagado", misma);

        }

        /*
        * Y los lápices de esa sección se esconden: no hay nada
        * que abrir mientras la dirección de envío sea la otra.
        * Se buscan por el campo que abren y no por dónde están,
        * que es lo único que no depende de cómo esté montado el
        * HTML alrededor.
        */

        document

            .querySelectorAll('.lapiz[data-abre^="shipping"]')

            .forEach(lapiz => {

                lapiz.hidden = misma;

            });

    }

    campo("shippingSame")
        .addEventListener("change", aplicarMismaDireccion);

    /*
    |----------------------------------------------------------
    | Guardar
    |----------------------------------------------------------
    */

    function avisar(texto, bien = true) {

        const aviso =
            campo("profileAviso");

        aviso.textContent = texto;

        aviso.className = `aviso ${bien ? "ok" : "error"}`;

        Toast.mostrar(texto, bien ? "ok" : "error");

    }

    function cerrarTodo() {

        document

            .querySelectorAll(".abierto")

            .forEach(nodo => {

                nodo.classList.remove("abierto");

                if (nodo.tagName === "SELECT") {

                    nodo.disabled = true;

                }
                else {

                    nodo.readOnly = true;

                }

            });

    }

    function leer(pares) {

        const valores = {};

        for (const [id, dato] of Object.entries(pares)) {

            valores[dato] = campo(id).value.trim();

        }

        return valores;

    }

    function anotar(seccion) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Perfil",

            accion: Log.ACCIONES.EDICION,

            registro: usuario?.name || "",

            detalle: seccion

        });

    }

    function guardar(seccion, cambios, comprobar) {

        if (!Permissions.exigir(Permissions.EDITAR)) {

            return;

        }

        const problema =
            comprobar?.(cambios);

        if (problema) {

            avisar(problema, false);

            return;

        }

        pintar(Profile.guardar(usuario, cambios));

        cerrarTodo();

        anotar(seccion);

        avisar(`${seccion}: cambios guardados.`);

    }

    campo("savePersonalButton").addEventListener("click", () => {

        guardar("Datos personales", leer(PERSONALES), cambios => {

            if (!cambios.nombre) {

                return "El nombre es obligatorio.";

            }

            if (cambios.email && !cambios.email.includes("@")) {

                return "El email personal no tiene forma de email.";

            }

            return null;

        });

    });

    campo("saveJobButton").addEventListener("click", () => {

        guardar("Puesto", leer(PUESTO), cambios => {

            const horas =
                Number(cambios.horas);

            return Number.isFinite(horas) && horas > 0 && horas <= 40
                ? null
                : "Las horas semanales tienen que estar entre 1 y 40.";

        });

    });

    campo("saveAddressButton").addEventListener("click", () => {

        guardar("Dirección", { direccion: leer(DIRECCION) });

    });

    campo("saveShippingButton").addEventListener("click", () => {

        guardar("Dirección de envío", {

            envio: {

                ...leer(ENVIO),

                mismaDireccion: campo("shippingSame").checked

            }

        });

    });

    pintar(Profile.de(usuario));

    Permissions.aplicar();

});
