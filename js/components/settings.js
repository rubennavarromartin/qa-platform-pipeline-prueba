/*
|--------------------------------------------------------------------------
| Configuración
|--------------------------------------------------------------------------
|
| Los parámetros de la sociedad y de la agenda: cosas que no son
| registros de nadie pero mandan sobre todos.
|
| El IVA vivía escrito dentro del repositorio de presupuestos.
| Ahí no había forma de cambiarlo sin tocar código, que es justo
| lo que ninguna aplicación empresarial hace: el tipo impositivo
| es un parámetro de la sociedad, y se cambia desde una pantalla.
|
| Para la plataforma es un caso que no tenía: una pantalla cuyos
| campos no son un registro, sino ajustes que cambian el
| comportamiento de otras pantallas. Cambiar el IVA cambia el
| total de todos los presupuestos; cambiar el intervalo de
| minutos cambia lo que ofrece el desplegable de una cita.
|
*/

const Settings = (() => {

    const STORAGE_KEY = "qa-platform-settings";

    /*
    * Los intervalos de minutos que se pueden elegir.
    *
    *   1    todos los minutos, del 00 al 59
    *   15   00, 15, 30 y 45
    *   30   00 y 30
    */

    const INTERVALOS = [1, 15, 30];

    /*
    * Los días de la semana, en el orden en que se enseñan y con
    * el número que les da JavaScript: getDay() cuenta desde el
    * domingo, que es 0. Se guarda ese número y no la posición en
    * esta lista para no tener que traducir cada vez que se mira
    * una fecha.
    */

    const DIAS = [

        { dia: 1, nombre: "Lunes",     corto: "Lun" },
        { dia: 2, nombre: "Martes",    corto: "Mar" },
        { dia: 3, nombre: "Miércoles", corto: "Mié" },
        { dia: 4, nombre: "Jueves",    corto: "Jue" },
        { dia: 5, nombre: "Viernes",   corto: "Vie" },
        { dia: 6, nombre: "Sábado",    corto: "Sáb" },
        { dia: 0, nombre: "Domingo",   corto: "Dom" }

    ];

    const POR_DEFECTO = {

        /* Sociedad */

        sociedad: "CRM Laboratory, S.L.",

        cif: "B00000000",

        iva: 21,

        /* Agenda */

        intervalo: 15,

        horaObligatoria: true,

        /*
        * El horario de trabajo: qué días se atiende y entre qué
        * horas. De lunes a viernes, de ocho a ocho.
        */

        dias: [1, 2, 3, 4, 5],

        desde: 8,

        hasta: 20

    };

    function leer() {

        try {

            return {

                ...POR_DEFECTO,

                ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")

            };

        }
        catch {

            return { ...POR_DEFECTO };

        }

    }

    return {

        INTERVALOS,

        DIAS,

        POR_DEFECTO,

        todos() {

            return leer();

        },

        /*
        * El tipo de IVA que se aplica a los presupuestos.
        */

        iva() {

            const valor =
                Number(leer().iva);

            return Number.isFinite(valor) && valor >= 0
                ? valor
                : POR_DEFECTO.iva;

        },

        intervalo() {

            const valor =
                Number(leer().intervalo);

            return INTERVALOS.includes(valor)
                ? valor
                : POR_DEFECTO.intervalo;

        },

        horaObligatoria() {

            return Boolean(leer().horaObligatoria);

        },

        /*
        * Los minutos que ofrece el desplegable de una cita, según
        * el intervalo elegido: todos, de cuarto en cuarto o de
        * media en media.
        */

        minutos() {

            const paso =
                this.intervalo();

            const valores = [];

            for (let minuto = 0; minuto < 60; minuto += paso) {

                valores.push(String(minuto).padStart(2, "0"));

            }

            return valores;

        },

        /*
        * Las horas que se ofrecen: las del horario de trabajo.
        *
        * Eran las veinticuatro. Ninguna aplicación de agenda
        * ofrece concertar una cita a las cuatro de la mañana, y
        * ofrecerlas todas es dejar que se cuelen.
        *
        * El intervalo manda sobre los minutos y el horario sobre
        * las horas: una cita a las tres y media es normal, una
        * cita "cada tres horas" no es nada.
        */

        horas() {

            const { desde, hasta } =
                this.horario();

            const valores = [];

            for (let hora = desde; hora <= hasta; hora++) {

                valores.push(String(hora).padStart(2, "0"));

            }

            return valores;

        },

        /*
        * De qué hora a qué hora. Se corrige lo que no tenga
        * sentido en lugar de creérselo: una franja al revés
        * —de las ocho a las seis— dejaría la agenda sin ninguna
        * hora que ofrecer.
        */

        horario() {

            const ajustes =
                leer();

            const entero =
                (valor, respaldo) => {

                    const numero =
                        Number(valor);

                    return Number.isInteger(numero) && numero >= 0 && numero <= 23
                        ? numero
                        : respaldo;

                };

            const desde =
                entero(ajustes.desde, POR_DEFECTO.desde);

            const hasta =
                entero(ajustes.hasta, POR_DEFECTO.hasta);

            return desde <= hasta
                ? { desde, hasta }
                : { desde: hasta, hasta: desde };

        },

        /*
        * Los días de la semana que se atienden, con el número que
        * les da getDay(). Sin ninguno no habría agenda que
        * enseñar, así que se cae a los de partida.
        */

        diasDeTrabajo() {

            const guardados =
                leer().dias;

            const validos =
                Array.isArray(guardados)
                    ? guardados
                        .map(Number)
                        .filter(dia => DIAS.some(d => d.dia === dia))
                    : [];

            return validos.length
                ? validos
                : [...POR_DEFECTO.dias];

        },

        /*
        * Si una fecha cae en día de trabajo. Recibe la fecha como
        * la guarda la aplicación (2026-08-12).
        */

        esDiaDeTrabajo(fecha) {

            if (!fecha) {

                return true;

            }

            const [ano, mes, dia] =
                String(fecha).split("-").map(Number);

            if (!ano || !mes || !dia) {

                return true;

            }

            return this.diasDeTrabajo().includes(
                new Date(ano, mes - 1, dia).getDay()
            );

        },

        /*
        * Si una hora cae dentro del horario. Los minutos no
        * cuentan: la última hora que se ofrece es una hora
        * entera, y una cita a las 20:30 con horario hasta las 20
        * sigue siendo de las ocho.
        */

        estaEnHorario(hora) {

            if (!hora) {

                return true;

            }

            const { desde, hasta } =
                this.horario();

            const cual =
                Number(String(hora).split(":")[0]);

            return Number.isInteger(cual) && cual >= desde && cual <= hasta;

        },

        /*
        * Cómo se lee el horario, para poder decirlo en un aviso.
        */

        horarioEnPalabras() {

            const { desde, hasta } =
                this.horario();

            const dias =
                this.diasDeTrabajo();

            const nombres =
                DIAS

                    .filter(d => dias.includes(d.dia))

                    .map(d => d.nombre.toLowerCase());

            return `${nombres.join(", ")}, de ${desde}:00 a ${hasta}:00`;

        },

        guardar(cambios) {

            const nuevos =
                { ...leer(), ...cambios };

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(nuevos)

            );

            return nuevos;

        },

        restaurar() {

            localStorage.removeItem(STORAGE_KEY);

            return { ...POR_DEFECTO };

        }

    };

})();
