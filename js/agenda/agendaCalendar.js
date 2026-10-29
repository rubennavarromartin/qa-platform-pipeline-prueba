/*
|--------------------------------------------------------------------------
| AgendaCalendar
|--------------------------------------------------------------------------
|
| La misma agenda, vista por meses. No guarda nada ni decide
| nada: lee las citas del repositorio y las coloca en su día.
|
| Está hecho con divs y no con una tabla a propósito. La rejilla
| de la pantalla es la de las citas, y una segunda tabla en la
| misma página confundiría a quien la lea de fuera.
|
*/

const AgendaCalendar = (() => {

    const MESES = [

        "enero", "febrero", "marzo", "abril",
        "mayo", "junio", "julio", "agosto",
        "septiembre", "octubre", "noviembre", "diciembre"

    ];

    /*
    * Los días que se pintan y en qué orden: los del horario de
    * trabajo, de lunes a domingo.
    *
    * El calendario tenía siempre siete columnas. Ahora tiene las
    * que se atiendan: con el horario de lunes a viernes, un mes
    * se ve en cinco columnas y sin sábados ni domingos por medio,
    * que es lo que se quiere mirar. Las columnas son las que son
    * cada vez, así que la rejilla se dice desde aquí y no desde
    * la hoja de estilos.
    */

    function columnas() {

        const trabajo =
            typeof Settings !== "undefined"
                ? Settings.diasDeTrabajo()
                : [1, 2, 3, 4, 5, 6, 0];

        const semana =
            typeof Settings !== "undefined"
                ? Settings.DIAS
                : [
                    { dia: 1, corto: "Lun" }, { dia: 2, corto: "Mar" },
                    { dia: 3, corto: "Mié" }, { dia: 4, corto: "Jue" },
                    { dia: 5, corto: "Vie" }, { dia: 6, corto: "Sáb" },
                    { dia: 0, corto: "Dom" }
                ];

        return semana.filter(({ dia }) => trabajo.includes(dia));

    }

    /*
    * El mes que se está mirando. Empieza en el de hoy.
    */

    const hoy = new Date();

    let year = hoy.getFullYear();

    let month = hoy.getMonth();

    function clave(year, month, day) {

        return [

            year,

            String(month + 1).padStart(2, "0"),

            String(day).padStart(2, "0")

        ].join("-");

    }

    /*
    * Cuántos huecos hay que dejar antes del primer día que se
    * pinta: los que ocupa su columna dentro de la semana.
    *
    * Era "la semana empieza en lunes y getDay() cuenta desde el
    * domingo". Ahora las columnas son las que se atiendan, así
    * que el hueco es la posición de ese día entre ellas y no su
    * día de la semana. Saltándose los días que no se atienden,
    * los que quedan caen siempre en columnas seguidas.
    */

    function huecos(primero) {

        const donde =
            columnas().findIndex(({ dia }) => dia === primero.getDay());

        return Math.max(0, donde);

    }

    function diasDelMes(year, month) {

        return new Date(year, month + 1, 0).getDate();

    }

    function renderDay(day) {

        const fecha =
            clave(year, month, day);

        const citas =
            Appointments.findByDate(fecha);

        const esHoy =
            fecha === clave(
                hoy.getFullYear(),
                hoy.getMonth(),
                hoy.getDate()
            );

        return `

<div
    class="calendar-day ${esHoy ? "today" : ""}"
    data-date="${fecha}">

    <span class="calendar-number">${day}</span>

    ${citas.map(cita => `
    <a
        class="calendar-event ${cita.status.toLowerCase()}"
        href="agenda.html?id=${cita.id}">
        ${cita.time} ${cita.subject}
    </a>`).join("")}

</div>

`;

    }

    /*
    * En un día del calendario hay dos cosas que pulsar, y hacen
    * cosas distintas:
    *
    *   la cita     lleva a su ficha
    *   el hueco    abre el alta con ese día puesto
    *
    * Pulsar una cita no debe además abrir el alta, así que el
    * clic se detiene ahí. Sin eso, ir a una cita dejaría un
    * formulario abierto detrás.
    */

    function bindEvents() {

        document
            .querySelectorAll(".calendar-day")
            .forEach(celda => {

                celda.onclick = () => {

                    AppointmentForm.open(
                        {},
                        celda.dataset.date
                    );

                };

            });

        document
            .querySelectorAll(".calendar-event")
            .forEach(cita => {

                cita.onclick = evento => {

                    evento.stopPropagation();

                };

            });

    }

    function mover(meses) {

        const destino =
            new Date(year, month + meses, 1);

        year = destino.getFullYear();

        month = destino.getMonth();

        render();

    }

    function render() {

        const titulo =
            document.getElementById("calendarMonth");

        if (!titulo) {

            return;

        }

        titulo.textContent =
            `${MESES[month]} de ${year}`;

        const cabeceras =
            columnas();

        const seAtiende =
            cabeceras.map(({ dia }) => dia);

        /*
        * Los días del mes que caen en un día que se atiende. Los
        * demás no se pintan: no es que estén vacíos, es que ese
        * día no existe para esta agenda.
        */

        const dias =
            Array

                .from(
                    { length: diasDelMes(year, month) },
                    (unused, i) => new Date(year, month, i + 1)
                )

                .filter(fecha => seAtiende.includes(fecha.getDay()));

        const celdas = [

            ...cabeceras.map(({ corto }) =>
                `<div class="calendar-weekday">${corto}</div>`
            ),

            ...Array.from(
                { length: dias.length ? huecos(dias[0]) : 0 },
                () => `<div class="calendar-day empty"></div>`
            ),

            ...dias.map(fecha => renderDay(fecha.getDate()))

        ];

        const rejilla =
            document.getElementById("calendarGrid");

        rejilla.style.gridTemplateColumns =
            `repeat(${cabeceras.length}, 1fr)`;

        rejilla.innerHTML = celdas.join("");

        bindEvents();

    }

    return {

        render,

        create() {

            const anterior =
                document.getElementById("previousMonthButton");

            const siguiente =
                document.getElementById("nextMonthButton");

            const actual =
                document.getElementById("currentMonthButton");

            if (anterior) {

                anterior.onclick = () => mover(-1);

            }

            if (siguiente) {

                siguiente.onclick = () => mover(1);

            }

            if (actual) {

                actual.onclick = () => {

                    year = hoy.getFullYear();

                    month = hoy.getMonth();

                    render();

                };

            }

            render();

        }

    };

})();
