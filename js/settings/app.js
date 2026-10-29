/*
|--------------------------------------------------------------------------
| Configuración
|--------------------------------------------------------------------------
|
| Los dos formularios de parámetros: los de la sociedad y los de
| la agenda.
|
| Cada uno guarda por su cuenta. Un solo botón para los dos
| obligaría a leer las dos pestañas al guardar, y quien cambia el
| IVA no tiene por qué estar tocando la agenda.
|
| Se anota en el log, como todo lo demás. Cambiar el IVA es un
| cambio que afecta a todos los presupuestos: si no quedara
| anotado, el día que los totales no cuadren no habría forma de
| saber cuándo cambió ni quién lo cambió.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const sociedad =
        document.getElementById("societyForm");

    const agenda =
        document.getElementById("agendaForm");

    const presupuestos =
        document.getElementById("quoteCodeForm");

    if (!sociedad || !agenda || !presupuestos) {

        return;

    }

    const campo =
        id => document.getElementById(id);

    /*
    * Las veinticuatro horas del día, para elegir la franja. Aquí
    * sí van todas: es donde se decide cuáles se ofrecerán
    * después.
    */

    function horasHtml(elegida) {

        return Array.from({ length: 24 }, (unused, hora) => `
                <option value="${hora}" ${hora === elegida ? "selected" : ""}>
                    ${String(hora).padStart(2, "0")}:00
                </option>`).join("");

    }

    /*
    * Lo guardado, en los campos.
    */

    function pintar() {

        const ajustes =
            Settings.todos();

        campo("societyName").value = ajustes.sociedad;

        campo("societyTaxId").value = ajustes.cif;

        campo("societyVat").value = ajustes.iva;

        campo("agendaInterval").value = String(ajustes.intervalo);

        campo("agendaTimeRequired").checked = Boolean(ajustes.horaObligatoria);

        const dias =
            Settings.diasDeTrabajo();

        for (const { dia } of Settings.DIAS) {

            const casilla =
                campo(`agendaDay${dia}`);

            if (casilla) {

                casilla.checked = dias.includes(dia);

            }

        }

        const { desde, hasta } =
            Settings.horario();

        campo("agendaFrom").innerHTML = horasHtml(desde);

        campo("agendaTo").innerHTML = horasHtml(hasta);

        campo("agendaHorario").textContent =
            `Ahora mismo se atiende ${Settings.horarioEnPalabras()}. ` +
            `Una cita fuera de ese horario no se puede guardar.`;

        pintarPresupuestos();

    }

    /*
    * Los tres parámetros del código de un presupuesto.
    *
    * El contador es de cada ejercicio, así que lo que se enseña abajo
    * depende del año elegido arriba. Es el primer campo de este
    * laboratorio cuyo valor lo decide otro campo de la misma pantalla, y
    * por eso se repinta al cambiar el año en lugar de leerse una vez.
    */

    function pintarPresupuestos() {

        const suyos =
            Codigos.ajustes();

        campo("quotePrefix").value = suyos.prefijo;

        campo("quoteYear").innerHTML =
            Codigos.ejercicios().map(ano => `
                <option value="${ano}" ${
                    ano === suyos.ejercicio ? "selected" : ""
                }>${ano}</option>`).join("");

        pintarContador();

    }

    function pintarContador() {

        const ejercicio =
            Number(campo("quoteYear").value);

        const prefijo =
            Codigos.limpiarPrefijo(campo("quotePrefix").value);

        const contador =
            Codigos.contador(ejercicio, prefijo);

        campo("quoteCounter").value = contador;

        /*
        * Y se dice qué código va a proponer, que es lo único que se puede
        * comprobar de un vistazo: un número suelto no dice si va a chocar
        * con algo.
        */

        campo("quoteCounterAyuda").textContent =
            `El siguiente presupuesto de ${ejercicio} se propondrá como ` +
            `${Codigos.siguiente(ejercicio, prefijo)}.`;

    }

    function anotar(que, detalle) {

        if (typeof Log === "undefined") {

            return;

        }

        Log.anotar({

            entidad: "Configuración",

            accion: Log.ACCIONES.EDICION,

            registro: que,

            detalle

        });

    }

    function avisar(id, texto, bien = true) {

        const aviso =
            campo(id);

        aviso.textContent = texto;

        aviso.className = `aviso ${bien ? "ok" : "error"}`;

        Toast.mostrar(texto, bien ? "ok" : "error");

    }

    /*
    | Sociedad
    */

    sociedad.addEventListener("submit", evento => {

        evento.preventDefault();

        if (!Permissions.exigir(Permissions.EDITAR)) {

            return;

        }

        const iva =
            Number(campo("societyVat").value);

        if (!Number.isFinite(iva) || iva < 0 || iva > 100) {

            avisar("societyAviso", "El IVA tiene que estar entre 0 y 100.", false);

            return;

        }

        Settings.guardar({

            sociedad: campo("societyName").value.trim(),

            cif: campo("societyTaxId").value.trim(),

            iva

        });

        anotar("Sociedad", `IVA ${iva} %`);

        avisar("societyAviso", "Parámetros de la sociedad guardados.");

    });

    /*
    | Agenda
    */

    agenda.addEventListener("submit", evento => {

        evento.preventDefault();

        if (!Permissions.exigir(Permissions.EDITAR)) {

            return;

        }

        const intervalo =
            Number(campo("agendaInterval").value);

        const obligatoria =
            campo("agendaTimeRequired").checked;

        const dias =
            Settings.DIAS

                .map(({ dia }) => dia)

                .filter(dia => campo(`agendaDay${dia}`)?.checked);

        const desde =
            Number(campo("agendaFrom").value);

        const hasta =
            Number(campo("agendaTo").value);

        /*
        * Sin ningún día no hay agenda, y con la franja al revés
        * no hay ninguna hora que ofrecer. Las dos cosas se
        * cuentan antes de guardar: corregirlas por detrás dejaría
        * guardado algo distinto de lo que se ve en la pantalla.
        */

        if (!dias.length) {

            avisar("agendaAviso", "Marca al menos un día de la semana.", false);

            return;

        }

        if (desde > hasta) {

            avisar(
                "agendaAviso",
                "La hora de inicio tiene que ser anterior a la de fin.",
                false
            );

            return;

        }

        Settings.guardar({

            intervalo,

            horaObligatoria: obligatoria,

            dias,

            desde,

            hasta

        });

        anotar(
            "Agenda",
            `Minutos de ${intervalo} en ${intervalo}, ` +
            `hora ${obligatoria ? "obligatoria" : "opcional"}, ` +
            Settings.horarioEnPalabras()
        );

        avisar("agendaAviso", "Parámetros de la agenda guardados.");

        pintar();

    });

    /*
    | Presupuestos
    */

    campo("quoteYear").addEventListener("change", pintarContador);

    /*
    * El prefijo también cambia el contador, porque cada serie se cuenta
    * sola: los "OFE-2026-…" no saben nada de los "PRE-2026-…".
    */

    campo("quotePrefix").addEventListener("input", pintarContador);

    presupuestos.addEventListener("submit", evento => {

        evento.preventDefault();

        if (!Permissions.exigir(Permissions.EDITAR)) {

            return;

        }

        const escrito =
            campo("quotePrefix").value.trim();

        /*
        * El prefijo se comprueba en lugar de corregirse: corregir por
        * detrás dejaría guardado algo distinto de lo que se ha escrito, y
        * es lo que ya se decidió con el horario de la agenda.
        */

        if (!/^[A-Za-z0-9]{3}$/.test(escrito)) {

            avisar(
                "presupuestosAviso",
                "El prefijo son tres letras o números, sin espacios ni guiones.",
                false
            );

            return;

        }

        const ejercicio =
            Number(campo("quoteYear").value);

        const contador =
            Number(campo("quoteCounter").value);

        if (!Number.isInteger(contador) || contador < 0) {

            avisar(
                "presupuestosAviso",
                "El contador es un número entero y no puede ser negativo.",
                false
            );

            return;

        }

        const prefijo =
            escrito.toUpperCase();

        const contadores =
            { ...Codigos.ajustes().contadores, [String(ejercicio)]: contador };

        Settings.guardar({

            presupuestoPrefijo: prefijo,

            presupuestoEjercicio: ejercicio,

            presupuestoContadores: contadores

        });

        anotar(
            "Presupuestos",
            `${prefijo}, ejercicio ${ejercicio}, contador ${contador}`
        );

        pintarContador();

        avisar(
            "presupuestosAviso",
            `Guardado. El siguiente será ${Codigos.siguiente(ejercicio, prefijo)}.`
        );

    });

    pintar();

    /*
    * Y la pestaña de estados de proyecto, que es un CRUD entero y vive en
    * su propio fichero: este arranque ya tiene bastante con tres formularios
    * de ajustes.
    */

    if (typeof EstadosDeProyecto !== "undefined") {

        EstadosDeProyecto.montar();

    }

    Permissions.aplicar();

});
