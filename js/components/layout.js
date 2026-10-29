/*
|--------------------------------------------------------------------------
| Layout
|--------------------------------------------------------------------------
|
| El menú lateral, que es el mismo en las siete pantallas.
|
| Se pinta desde aquí y no se copia en cada HTML por lo de
| siempre: siete copias del mismo menú son siete sitios donde
| olvidarse de añadir un módulo nuevo. Que lo pinte JavaScript
| tiene además el interés de costumbre para el laboratorio: es
| como se mueven las aplicaciones de una sola página, y quien
| explore la aplicación sólo lo verá si ejecuta la página en un
| navegador de verdad en lugar de leerse el HTML.
|
| Los elementos del menú son botones que navegan por JavaScript,
| no enlaces. Era el caso que planteaba el viejo botón de "volver
| al menú principal" —que ha desaparecido porque con un menú
| lateral no pinta nada—, y ahora está en las siete secciones en
| lugar de en una.
|
| "Inicio" conserva el identificador `homeButton` y quien lo
| engancha sigue siendo Navigation: este fichero pinta el menú,
| no se ocupa de lo que ya tiene dueño.
|
*/

const Layout = (() => {

    /*
    * Cada módulo con su pantalla, su icono y de dónde sale su
    * cuenta: el objeto global de su repositorio, si la pantalla
    * lo ha cargado, y si no, la clave con la que guarda.
    */

    const MODULOS = [

        {
            clave: "home",
            nombre: "Inicio",
            icono: "◧",
            href: "index.html",
            id: "homeButton"
        },

        {
            clave: "companies",
            nombre: "Empresas",
            icono: "▤",
            href: "companies.html",
            repositorio: "Companies",
            almacen: "qa-platform-companies"
        },

        {
            clave: "contacts",
            nombre: "Contactos",
            icono: "◇",
            href: "contacts.html",
            repositorio: "Contacts",
            almacen: "crm-demo-contacts"
        },

        {
            clave: "agenda",
            nombre: "Agenda",
            icono: "◷",
            href: "agenda.html",
            repositorio: "Appointments",
            almacen: "qa-platform-agenda"
        },

        {
            clave: "quotes",
            nombre: "Presupuestos",
            icono: "◈",
            href: "quotes.html",
            repositorio: "Quotes",
            almacen: "qa-platform-quotes"
        },

        /*
        * Proyectos, que es el único módulo que **casi nadie ve**.
        *
        * Pide un permiso propio, y hay un rol que sólo tiene ése: para él
        * este menú tiene una entrada y ninguna más. Los demás roles no lo
        * ven, así que la misma aplicación enseña aquí desde un menú entero
        * hasta un menú de uno según quién entre.
        */

        {
            clave: "projects",
            nombre: "Proyectos",
            icono: "▨",
            href: "projects.html",
            repositorio: "Projects",
            almacen: "qa-platform-projects"
        },

        /*
        * Y un grupo que **la aplicación recuerda** (16 de octubre de 2026).
        *
        * Es el menú de Meristec: cada apartado se pliega y se despliega con un
        * botón que dice `aria-expanded`, y lo que se deja se guarda en el
        * navegador, así que al volver a la pantalla —o al recargarla— sigue
        * como se dejó. Y el apartado de la pantalla en la que se está se abre
        * siempre, mande lo que mande lo guardado.
        *
        * La pregunta que plantea, junto con «Ocultar el menú», que también se
        * recuerda y va **detrás** del menú en el documento:
        *
        *     ¿dejas el menú como lo encontraste después de explorarlo?
        *
        * En el Build de Meristec del 16 de octubre no: en cada pantalla avisó
        * de que sus cuatro apartados «se han quedado como no estaban y
        * pulsarlos otra vez no los devuelve». Medido contra un Meristec de
        * prueba, pulsar otra vez sí devuelve un apartado. Lo que pasaba es que
        * el Discovery devuelve los controles en el orden en que los encontró
        * —primero los apartados, después «Ocultar el menú»—, y con el menú
        * todavía oculto los apartados no se pueden pulsar.
        *
        * Los otros dos grupos no lo planteaban: Administración no declara
        * `aria-expanded` y Operaciones tampoco —son sus casos—, y ninguno de
        * los dos se recuerda: al recargar vuelven a como eran. Por eso éste es
        * un grupo propio, con dos entradas, que es lo mínimo para que algo se
        * lea como un menú.
        */

        {
            grupo: "Seguimiento",
            clave: "seguimiento",
            plegable: true,
            recordado: true
        },

        {
            clave: "panel",
            nombre: "Cuadro de mando",
            icono: "◱",
            href: "panel.html",
            dentro: "seguimiento"
        },

        {
            clave: "activity",
            nombre: "Actividad",
            icono: "≡",
            href: "activity.html",
            almacen: "qa-platform-log",
            dentro: "seguimiento"
        },

        {
            clave: "profile",
            nombre: "Mi perfil",
            icono: "☺",
            href: "profile.html"
        },

        {
            grupo: "Configuración"
        },

        /*
        * Mantenimiento existe por la puerta que tiene delante: una pregunta
        * que hay que contestar para entrar, como la de MiPizarra. El porqué
        * entero, en `mantenimiento.html`.
        */

        {
            clave: "mantenimiento",
            nombre: "Mantenimiento",
            icono: "⚒",
            href: "mantenimiento.html"
        },

        /*
        * Almacén abre sus pantallas como ventanas en la misma página, sin que
        * cambie la dirección: la forma de la facturación de ejemplo. El porqué
        * entero, en `almacen.html`.
        */

        {
            clave: "almacen",
            nombre: "Almacén",
            icono: "▤",
            href: "almacen.html"
        },

        /*
        * Y un grupo que **se abre**, con dos secciones dentro.
        *
        * Es el caso que plantea AUTOSTOCKNUVEX y que aquí no había: seis de
        * sus nueve entradas de menú no llevan a ninguna parte —se pulsan y la
        * dirección no cambia— y lo que hacen es desplegar las secciones de
        * verdad. "VENTAS" abre cinco enlaces, "TERCEROS" otros dos. Medido el
        * 8 de septiembre de 2026.
        *
        * El laboratorio tenía el caso contrario —"Configuración", un
        * encabezado que no se abre ni lleva a nada— y hay que seguir
        * distinguiéndolos, así que se queda donde está.
        *
        * Nace cerrado y no se acuerda de nada al recargar, que es lo que hace
        * la aplicación real: así una prueba que quiera llegar a Usuarios
        * tiene que abrir el grupo primero, y eso es justo lo que hay que
        * comprobar que la plataforma aprende a hacer.
        *
        * Y no declara nada de lo que serviría para reconocerlo sin pulsarlo:
        * no es `button`, no es `a`, no dice `role` ni `aria-haspopup` ni
        * `aria-expanded`. Se le deja el teclado, como a Informes: lo que se
        * plantea es cómo se reconoce, no dejar a nadie fuera.
        *
        * Usuarios y Roles siguen teniendo su tarjeta en la pantalla de
        * entrada, así que las dos pantallas se siguen alcanzando aunque el
        * grupo no se abra. Lo que se pierde mientras no se abra son sus
        * salidas desde cada pantalla, y eso son cuarenta y cuatro pruebas: lo
        * bastante para que se vea.
        */

        {
            grupo: "Administración",
            clave: "administracion",
            plegable: true
        },

        {
            clave: "users",
            nombre: "Usuarios",
            icono: "◍",
            href: "users.html",
            repositorio: "Users",
            almacen: "qa-platform-users",
            dentro: "administracion"
        },

        {
            clave: "roles",
            nombre: "Roles",
            icono: "⚙",
            href: "roles.html",
            repositorio: "Roles",
            almacen: "qa-platform-roles",
            dentro: "administracion"
        },

        {
            clave: "kpis",
            nombre: "Mis cifras",
            icono: "◔",
            href: "kpis.html"
        },

        {
            clave: "aprobaciones",
            nombre: "Aprobaciones",
            icono: "✓",
            href: "approvals.html",
            repositorio: "Aprobaciones",
            almacen: "qa-platform-aprobaciones"
        },

        /*
        * Y otro grupo que se abre, distinto del de Administración en lo que
        * importa: la cabecera **es un `button`** —sin `aria-expanded` ni
        * `aria-haspopup`, nada que diga que despliega— y lo que lleva dentro
        * son **enlaces**, `a` con su `href`.
        *
        * Es el menú de SABESP, medido el 14 de octubre de 2026: nueve grupos
        * como éste y la plataforma no abrió ninguno, así que de 58 pantallas
        * leyó 14. Un `div` que no se declara control lo pulsa quien busca
        * entradas que no lo dicen; un `button` se daba por probado por quien
        * mira los botones, y ése sólo mira si **navega**. Una cabecera de
        * grupo no navega: despliega.
        *
        * Y lo de dentro **no existe hasta abrirlo**, que es lo que lo hace
        * difícil. Administración esconde sus entradas con `hidden` y siguen
        * en el documento; SABESP no las pinta hasta que se pulsa —Angular, con
        * un `*ngIf`—, medido el mismo día: cero enlaces del grupo cerrado,
        * cuatro abierto. La primera versión de este caso las escondía como
        * Administración, y el Discovery llegaba a Gastos sin abrir nada: leía
        * los enlaces del documento aunque no se vieran. Era otra pregunta.
        */

        {
            grupo: "Operaciones",
            clave: "operaciones",
            plegable: true,
            cabeceraBoton: true
        },

        /*
        * Gastos existe por su botón de alta, que se llama "Subir gasto" y no
        * "Nuevo gasto". Es el caso de Bitácora traído a donde se puede medir:
        * si la plataforma sólo reconoce un alta por el texto del botón, esta
        * pantalla se queda sin su prueba de CREATE y se ve contando. El porqué
        * entero, en `gastos.html`.
        */

        {
            clave: "gastos",
            nombre: "Gastos",
            icono: "€",
            href: "gastos.html",
            almacen: "qa-platform-gastos",
            dentro: "operaciones",
            enlace: true
        },

        /*
        * Vehículos existe por su alta, que no se abre en un diálogo sino en un
        * panel a pantalla completa que no se anuncia como tal, como el de
        * AUTOSTOCKNUVEX. Si la plataforma sólo reconoce un formulario por
        * cómo se llama su contenedor, esta pantalla se queda sin sus pruebas
        * de alta. El porqué entero, en `vehiculos.html`.
        */

        {
            clave: "vehiculos",
            nombre: "Vehículos",
            icono: "⛟",
            href: "vehiculos.html",
            almacen: "qa-platform-vehiculos",
            dentro: "operaciones",
            enlace: true
        },

        /*
        * Y una entrada que se llama como otra y lleva a otro sitio: "Cuadro de
        * mando" está en Seguimiento, que lleva al panel, y aquí, que lleva a
        * Informes. Es lo de SABESP, donde "Demanda Contratada" está en
        * Indicadores y en Simuladores y son dos pantallas distintas.
        *
        * Plantea dos preguntas, medidas el 16 de octubre de 2026. Qué entradas
        * aparecen al abrir este grupo se reconocía por su nombre, así que en
        * una pantalla donde ya se veía el otro "Cuadro de mando" ésta no
        * contaba como nueva y no salía ninguna prueba que llevara aquí. Y
        * cuando las dos se ven a la vez —en las pantallas de Seguimiento, que
        * lo tienen siempre abierto—, un selector por papel y nombre encuentra
        * dos.
        */

        {
            clave: "cuadroDeOperaciones",
            nombre: "Cuadro de mando",
            icono: "▦",
            href: "informes.html",
            dentro: "operaciones",
            enlace: true
        },


        {
            clave: "ayuda",
            nombre: "Ayuda",
            icono: "?",
            href: "help.html"
        },

        /*
        * Informes está en el menú y **no tiene tarjeta con `data-module`** en
        * la pantalla de entrada. No es un olvido: es el caso que pregunta si
        * la plataforma reconoce una sección que nadie anuncia. El porqué
        * entero, en `informes.html`.
        *
        * Y desde el 8 de septiembre de 2026 su entrada **no es un botón ni un
        * enlace**: es un `div` con un manejador, que es como navegan seis de
        * las nueve secciones de AUTOSTOCKNUVEX —`li` de Angular, sin `href` y
        * sin `button` dentro—. Así el laboratorio pregunta lo que preguntaba
        * aquella aplicación real, y lo pregunta donde se puede medir: si el
        * Discovery no pulsa lo que no se declara control, esta sección
        * desaparece entera del modelo, porque nada más lleva a ella.
        *
        * Se le deja `tabindex` y responde al teclado. Lo que se plantea es
        * cómo se **reconoce** un control, no dejar a nadie fuera: quitarle el
        * teclado no añadiría ninguna pregunta y haría el laboratorio peor.
        */

        {
            clave: "informes",
            nombre: "Informes",
            icono: "▦",
            href: "informes.html",
            sinControl: true
        },

        {
            clave: "settings",
            nombre: "Parámetros",
            icono: "◉",
            href: "settings.html"
        }

    ];

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    /*
    * Los repositorios que ha cargado la pantalla.
    *
    * Se preguntan uno a uno con `typeof` y no por `window`: un
    * `const` de primer nivel no se cuelga del objeto global, así
    * que `window.Companies` es siempre indefinido por mucho que
    * el fichero esté cargado.
    */

    function repositorioDe(nombre) {

        switch (nombre) {

            case "Companies":
                return typeof Companies !== "undefined" ? Companies : null;

            case "Contacts":
                return typeof Contacts !== "undefined" ? Contacts : null;

            case "Appointments":
                return typeof Appointments !== "undefined" ? Appointments : null;

            case "Quotes":
                return typeof Quotes !== "undefined" ? Quotes : null;

            case "Users":
                return typeof Users !== "undefined" ? Users : null;

            case "Roles":
                return typeof Roles !== "undefined" ? Roles : null;

            case "Aprobaciones":
                return typeof Aprobaciones !== "undefined" ? Aprobaciones : null;

            default:
                return null;

        }

    }

    /*
    * Cuántos registros tiene un módulo.
    *
    * Se pregunta al repositorio si la pantalla lo ha cargado,
    * porque es el único que conoce los registros de partida.
    * Leyendo sólo lo guardado, un navegador recién abierto diría
    * que no hay ninguna empresa cuando hay catorce.
    *
    * Si el módulo no está cargado se lee lo guardado, y si no hay
    * nada guardado la cuenta se deja en blanco: mejor no decir
    * nada que decir cero cuando no se sabe.
    */

    function cuenta(modulo) {

        /*
        * La actividad no tiene repositorio: la cuenta la sabe el
        * propio log, y se le pregunta a él para que las líneas de
        * partida cuenten igual que los registros de partida de
        * los demás módulos.
        */

        if (modulo.clave === "activity") {

            return typeof Log !== "undefined"
                ? Log.todas().length
                : "";

        }

        const repositorio =
            modulo.repositorio
                ? repositorioDe(modulo.repositorio)
                : null;

        if (repositorio?.findAll) {

            repositorio.load?.();

            return repositorio.findAll().length;

        }

        const guardado =
            modulo.almacen
                ? localStorage.getItem(modulo.almacen)
                : null;

        if (!guardado) {

            return "";

        }

        try {

            return JSON.parse(guardado).length;

        }
        catch {

            return "";

        }

    }

    /*
    * Si un grupo está abierto. Los de siempre, sólo si la pantalla actual es
    * una de las suyas. El recordado, además, si se dejó abierto: lo guardado
    * es la lista de los plegados, como la guarda Meristec, y sin nada
    * guardado se comporta como los demás.
    */

    const PLEGADOS = "qa-platform-menu-plegados";

    function plegadosRecordados() {

        try {

            const guardado = localStorage.getItem(PLEGADOS);

            return guardado === null ? null : JSON.parse(guardado);

        }
        catch (error) {

            return null;

        }

    }

    function grupoAbierto(grupo, actual) {

        if (!grupo) {

            return false;

        }

        const contieneActual =
            MODULOS.some(uno => uno.dentro === grupo.clave && uno.clave === actual);

        if (!grupo.recordado) {

            return contieneActual;

        }

        const plegados = plegadosRecordados();

        return contieneActual || (plegados ? !plegados.includes(grupo.clave) : false);

    }

    function itemHtml(modulo, activo, abierto) {

        if (modulo.grupo && modulo.plegable && modulo.recordado) {

            return `
            <button
                class="navGrupoPlegable navGrupoBoton"
                type="button"
                aria-expanded="${abierto ? "true" : "false"}"
                data-recordado="sí"
                data-grupo="${escapar(modulo.clave)}">

                <span class="navGrupoFlecha" aria-hidden="true">${abierto ? "▾" : "▸"}</span>
                ${escapar(modulo.grupo)}

            </button>`;

        }

        if (modulo.grupo && modulo.plegable && modulo.cabeceraBoton) {

            return `
            <button
                class="navGrupoPlegable navGrupoBoton"
                type="button"
                data-grupo="${escapar(modulo.clave)}">

                <span class="navGrupoFlecha" aria-hidden="true">${abierto ? "▾" : "▸"}</span>
                ${escapar(modulo.grupo)}

            </button>`;

        }

        if (modulo.grupo && modulo.plegable) {

            return `
            <div
                class="navGrupoPlegable"
                tabindex="0"
                data-grupo="${escapar(modulo.clave)}">

                <span class="navGrupoFlecha" aria-hidden="true">${abierto ? "▾" : "▸"}</span>
                ${escapar(modulo.grupo)}

            </div>`;

        }

        if (modulo.grupo) {

            return `
            <p class="navGrupo">${escapar(modulo.grupo)}</p>`;

        }

        const numero =
            cuenta(modulo);

        const dentro = `
                <span class="navIcono" aria-hidden="true">${modulo.icono}</span>
                ${escapar(modulo.nombre)}
                <span class="navCuenta">${numero}</span>`;

        /*
        * La entrada que no se declara control. Lleva lo mismo que las demás
        * —su módulo, su destino y la marca de la página en la que estamos—
        * y no lleva lo que la haría reconocible sin pulsarla: ni es `button`,
        * ni es `a`, ni dice `role`.
        */

        /*
        * Y si vive dentro de un grupo que se abre: lo dice, se sangra y se
        * esconde mientras el grupo esté cerrado. Se esconde de verdad —con
        * `hidden`— y no con opacidad: una entrada que se ve a medias es una
        * entrada que se ve.
        */

        const deUnGrupo =
            modulo.dentro
                ? ` data-dentro="${escapar(modulo.dentro)}"` +
                  (abierto ? "" : " hidden")
                : "";

        const sangrado =
            modulo.dentro ? " navItemDentro" : "";

        if (modulo.enlace) {

            /*
            * Con el grupo cerrado, no se pinta: ni escondida ni de ninguna
            * otra manera. Es lo que hace la aplicación de la que sale el caso.
            */

            if (modulo.dentro && !abierto) {

                return "";

            }

            /*
            * Y su icono, como lo pone SABESP: un `<i>` vacío que se pinta con
            * CSS y que no se esconde a los lectores de pantalla, así que su
            * carácter entra al principio del nombre accesible. Las demás
            * entradas llevan el icono en un `span` con `aria-hidden`, y eso no
            * planteaba la pregunta: el selector de una entrada de SABESP no
            * encontraba nada porque esperaba que el nombre empezara por la
            * palabra.
            */

            return `
            <a
                class="navItem${sangrado}"
                href="${escapar(modulo.href)}"
                data-modulo="${escapar(modulo.clave)}"${deUnGrupo}
                ${activo ? 'aria-current="page"' : ""}>
                <i class="navIcono navIconoFuente" data-icono="${escapar(modulo.icono)}"></i>
                ${escapar(modulo.nombre)}
                <span class="navCuenta">${cuenta(modulo)}</span>

            </a>`;

        }

        if (modulo.sinControl) {

            return `
            <div
                class="navItem${sangrado}"
                tabindex="0"
                data-modulo="${escapar(modulo.clave)}"
                data-href="${escapar(modulo.href)}"${deUnGrupo}
                ${activo ? 'aria-current="page"' : ""}>
${dentro}

            </div>`;

        }

        return `
            <button
                class="navItem${sangrado}"
                type="button"
                ${modulo.id ? `id="${modulo.id}"` : ""}
                data-modulo="${escapar(modulo.clave)}"
                data-href="${escapar(modulo.href)}"${deUnGrupo}
                ${activo ? 'aria-current="page"' : ""}>
${dentro}

            </button>`;

    }

    /*
    * Quién está usando la aplicación.
    */

    function usuario() {

        return typeof Session !== "undefined"
            ? Session.usuario()
            : "";

    }

    function papel() {

        return typeof Permissions !== "undefined"
            ? (Permissions.rol() || "")
            : "";

    }

    function inicial(nombre) {

        return (nombre || "?").trim().charAt(0).toUpperCase();

    }

    /*
    * Si el módulo se le puede enseñar a quien ha entrado.
    *
    * Esconder la entrada no impide nada —quien escriba la dirección llega
    * igual, y por eso hay un guardia más abajo—, pero enseñar un menú que
    * lleva a una pantalla que va a decir que no es peor que no enseñarlo.
    */

    function sePuedeAbrir(modulo) {

        return typeof Permissions === "undefined" ||
            Permissions.puedeEntrar(modulo.clave);

    }

    /*
    |----------------------------------------------------------
    | Esconder y traer el menú
    |----------------------------------------------------------
    |
    | El botón vive **fuera** del menú, pegado al contenido. Dentro no podría
    | servir para traerlo de vuelta: se iría con él.
    |
    | Y se acuerda de cómo se dejó, que es lo que hace cualquier aplicación
    | con un menú que se pliega. Eso tiene una consecuencia que conviene
    | tener escrita, porque afecta a quien explore esta aplicación: **con el
    | menú escondido no hay ninguna salida a la vista**. Una exploración que
    | arrancase con esa preferencia guardada leería una aplicación de una
    | sola pantalla.
    |
    | Por eso se guarda con una clave propia y **no se esconde de partida**:
    | hay que pedirlo. Y por eso el botón se queda siempre, con su
    | `aria-expanded`, que es lo que permite a quien lea la pantalla saber
    | que hay un menú y que está cerrado — en lugar de que no haya menú.
    */

    const MENU_ESCONDIDO = "qa-platform-menu-escondido";

    function menuEscondido() {

        try {

            return localStorage.getItem(MENU_ESCONDIDO) === "sí";

        }
        catch (error) {

            return false;

        }

    }

    function aplicarElMenu(escondido) {

        document.body.dataset.menuEscondido =
            escondido ? "sí" : "no";

        const boton =
            document.getElementById("menuButton");

        if (boton) {

            boton.setAttribute("aria-expanded", escondido ? "false" : "true");

            boton.setAttribute(
                "aria-label",
                escondido ? "Mostrar el menú" : "Ocultar el menú"
            );

            boton.textContent = escondido ? "☰" : "⟨";

        }

    }

    function montarElInterruptorDelMenu(lateral) {

        if (document.getElementById("menuButton")) {

            aplicarElMenu(menuEscondido());

            return;

        }

        const boton =
            document.createElement("button");

        boton.type = "button";

        boton.id = "menuButton";

        boton.className = "menuBoton";

        boton.setAttribute("aria-controls", lateral.id || "lateral");

        boton.onclick = () => {

            const ahora =
                !menuEscondido();

            try {

                localStorage.setItem(MENU_ESCONDIDO, ahora ? "sí" : "no");

            }
            catch (error) {

                /*
                * Sin poder guardar la preferencia el botón sigue valiendo
                * para esta pantalla, que es lo que se acaba de pedir.
                */

            }

            aplicarElMenu(ahora);

        };

        document.body.appendChild(boton);

        aplicarElMenu(menuEscondido());

    }

    function pintar() {

        const lateral =
            document.getElementById("lateral");

        if (!lateral) {

            return;

        }

        /*
        * Ninguna pantalla enseña nada sin sesión. Se comprueba
        * aquí porque el menú lateral es lo único que tienen las
        * siete en común: la alternativa era acordarse en cada
        * una.
        */

        if (typeof Session !== "undefined" && !Session.exigir()) {

            return;

        }

        const actual =
            document.body.dataset.modulo || "home";

        /*
        * Y si esta pantalla no es para quien ha entrado, se le dice que no.
        *
        * Va aquí, en lo único que comparten las siete pantallas, y justo
        * detrás de exigir la sesión: sin saber quién es no se puede decidir
        * nada.
        *
        * Se cambia la dirección en lugar de pintar el aviso encima. Una
        * pantalla que dice que no en la misma dirección que se pedía es,
        * desde fuera, indistinguible de una que no ha cargado, y desde fuera
        * es como se mira esto.
        */

        if (typeof Permissions !== "undefined" && !Permissions.puedeEntrar(actual)) {

            const suya =
                MODULOS.find(uno => uno.clave === actual);

            location.replace(
                `403.html?desde=${encodeURIComponent(suya?.href || "")}`
            );

            return;

        }

        const nombre =
            usuario();

        lateral.innerHTML = `

        <div class="marca">

            <span class="marcaSimbolo" aria-hidden="true">CL</span>

            <span class="marcaNombre">CRM Laboratory</span>

        </div>

        <nav class="navegacion" aria-label="Módulos">
${MODULOS.filter(sePuedeAbrir).map(modulo => itemHtml(

            modulo,

            modulo.clave === actual,

            /*
            * Abierto si la pantalla que se está viendo es una de las suyas.
            * Un menú que esconde la sección en la que estás no ayuda a nadie,
            * y de paso deja el caso más honrado: el grupo nace cerrado
            * **desde fuera**, que es como se llega explorando.
            */

            grupoAbierto(
                modulo.plegable ? modulo : MODULOS.find(uno => uno.clave === modulo.dentro),
                actual
            )

        )).join("")}
        </nav>

        <div class="lateralPie">

            <div class="sesionUsuario">

                <span class="sesionInicial" aria-hidden="true">${escapar(inicial(nombre))}</span>

                <span class="sesionDatos">

                    <span class="sesionNombre" id="sesionNombre">${escapar(nombre)}</span>

                    <span class="sesionPapel" id="sesionPapel">${escapar(papel())}</span>

                </span>

            </div>

            <div class="sesionAcciones">

                <button
                    id="logoutButton"
                    class="btn-secondary"
                    type="button">
                    Salir
                </button>

                <button
                    type="button"
                    class="iconoBoton"
                    id="temaButton"></button>

            </div>

        </div>`;

        enganchar(lateral);

        montarElInterruptorDelMenu(lateral);

        if (typeof Tema !== "undefined") {

            Tema.conectar();

        }

        /*
        * Lo que el rol de quien ha entrado no permite deja de
        * verse. Va después de pintar el menú porque necesita
        * saber el rol, y el rol sale de la sesión.
        */

        if (typeof Permissions !== "undefined") {

            Permissions.aplicar();

        }

    }

    function enganchar(lateral) {

        lateral

            .querySelectorAll(".navItem[data-href]")

            .forEach(boton => {

                /*
                * "Inicio" tiene dueño: Navigation. Engancharlo
                * aquí también lo haría navegar dos veces.
                */

                if (boton.id === "homeButton") {

                    return;

                }

                boton.addEventListener("click", () => {

                    window.location.href = boton.dataset.href;

                });

                /*
                * Y el teclado, para lo que no es un botón: un `div` no se
                * activa con Intro ni con la barra por su cuenta. Los que sí
                * son botones ya lo hacen, así que se les deja en paz — si no,
                * navegarían dos veces.
                */

                if (boton.tagName !== "BUTTON") {

                    boton.addEventListener("keydown", evento => {

                        if (evento.key !== "Enter" && evento.key !== " ") {

                            return;

                        }

                        evento.preventDefault();

                        window.location.href = boton.dataset.href;

                    });

                }

            });

        /*
        * Los grupos que se abren. Un clic o una tecla enseña lo que llevan
        * dentro y cambia la flecha.
        */

        lateral

            .querySelectorAll(".navGrupoPlegable[data-grupo]")

            .forEach(grupo => {

                /*
                * La cabecera que es un botón no esconde lo suyo: lo quita y lo
                * pone. Al abrir se pinta, al cerrar se borra. Y no lleva
                * manejador de teclado: un botón ya se pulsa con Enter y con
                * espacio, y con los dos el grupo se abriría y cerraría de golpe.
                */

                if (grupo.dataset.recordado) {

                    grupo.addEventListener("click", () => {

                        const abriendo =
                            grupo.getAttribute("aria-expanded") !== "true";

                        lateral
                            .querySelectorAll(`[data-dentro="${grupo.dataset.grupo}"]`)
                            .forEach(uno => { uno.hidden = !abriendo; });

                        grupo.setAttribute("aria-expanded", abriendo ? "true" : "false");

                        grupo.querySelector(".navGrupoFlecha").textContent = abriendo ? "▾" : "▸";

                        try {

                            localStorage.setItem(PLEGADOS, JSON.stringify(
                                [...lateral.querySelectorAll("[data-recordado][aria-expanded='false']")]
                                    .map(uno => uno.dataset.grupo)
                            ));

                        }
                        catch (error) {

                            /* Vale para esta pantalla aunque no se recuerde. */

                        }

                    });

                    return;

                }

                if (grupo.tagName === "BUTTON") {

                    grupo.addEventListener("click", () => {

                        const suyos =
                            lateral.querySelectorAll(
                                `[data-dentro="${grupo.dataset.grupo}"]`
                            );

                        const flecha =
                            grupo.querySelector(".navGrupoFlecha");

                        if (suyos.length) {

                            suyos.forEach(uno => uno.remove());

                            if (flecha) { flecha.textContent = "▸"; }

                            return;

                        }

                        grupo.insertAdjacentHTML(
                            "afterend",
                            MODULOS
                                .filter(sePuedeAbrir)
                                .filter(uno => uno.dentro === grupo.dataset.grupo)
                                .map(uno => itemHtml(uno, false, true))
                                .join("")
                        );

                        /*
                        * Y tardan en verse, como en SABESP: allí el grupo se
                        * despliega con una animación, y la lista está en el
                        * documento antes de verse. Sin esto el caso no hacía la
                        * pregunta entera — el Discovery reconocía este grupo
                        * mirando justo después del clic, y en SABESP, mirando
                        * igual, no reconocía ninguno de los nueve.
                        */

                        const recienPuestas =
                            lateral.querySelectorAll(
                                `[data-dentro="${grupo.dataset.grupo}"]`
                            );

                        recienPuestas.forEach(una => { una.hidden = true; });

                        setTimeout(
                            () => recienPuestas.forEach(una => { una.hidden = false; }),
                            400
                        );

                        if (flecha) { flecha.textContent = "▾"; }

                    });

                    return;

                }

                const alternar = () => {

                    const suyos =
                        lateral.querySelectorAll(
                            `[data-dentro="${grupo.dataset.grupo}"]`
                        );

                    const abriendo =
                        [...suyos].some(uno => uno.hidden);

                    suyos.forEach(uno => { uno.hidden = !abriendo; });

                    const flecha =
                        grupo.querySelector(".navGrupoFlecha");

                    if (flecha) {

                        flecha.textContent = abriendo ? "▾" : "▸";

                    }

                };

                grupo.addEventListener("click", alternar);

                grupo.addEventListener("keydown", evento => {

                    if (evento.key !== "Enter" && evento.key !== " ") {

                        return;

                    }

                    evento.preventDefault();

                    alternar();

                });

            });

        /*
        * Cerrar sesión. Se usa replace para no dejar la pantalla
        * en el historial: volver atrás después de salir no puede
        * enseñar lo que había dentro.
        */

        lateral

            .querySelector("#logoutButton")

            ?.addEventListener("click", () => {

                Session.salir();

                window.location.replace(Session.ACCESO);

            });

    }

    /*
    * Se pinta al ejecutarse y no al DOMContentLoaded a propósito:
    * el menú tiene que estar puesto antes de que corran los
    * enganches de los demás componentes, que sí esperan a
    * DOMContentLoaded y buscan sus botones.
    */

    pintar();

    return {

        pintar,

        MODULOS

    };

})();
