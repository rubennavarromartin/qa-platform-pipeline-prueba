/*
|--------------------------------------------------------------------------
| Mis cifras
|--------------------------------------------------------------------------
|
| Cuatro cajas con lo de quien ha entrado. No hay listado, ni
| buscador, ni formulario: es la pantalla más pequeña del
| laboratorio y está así a propósito, porque lo que plantea no es
| un componente nuevo sino **de quién son los datos**.
|
| Las cajas se pintan con la misma clase que las del cuadro de
| mando, y con el mismo cuidado: el nombre accesible de la caja es
| el del indicador y nada más. Si se dejara heredar sería "84.500
| € Cerrado este trimestre" —la cifra dentro del nombre— y
| cambiaría cada vez que cambien los datos, que es la trampa del
| identificador con número de serie.
|
| Y el cumplimiento sale de las otras dos, que es la pregunta
| encadenada: 84.500 de 120.000 son el 70,4 %. Está a la vista,
| sin tabla y sin total, para ver si la plataforma lo deduce.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const caja =
        document.getElementById("misIndicadores");

    const deQuien =
        document.getElementById("misCifrasDeQuien");

    const vacio =
        document.getElementById("misCifrasVacio");

    if (!caja) {

        return;

    }

    MisCifras.load();

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    /*
    * Con separador de miles, que es como se lee un importe. Se
    * escribe a mano y no con `toLocaleString` para que la cifra
    * sea la misma en cualquier navegador: la plataforma la lee, y
    * un espacio fino en lugar de un punto la deja sin leer.
    */

    function euros(importe) {

        const entero =
            String(Math.round(Number(importe) || 0));

        const conPuntos =
            entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return `${conPuntos} €`;

    }

    const mias =
        MisCifras.mias();

    if (!mias) {

        if (deQuien) {

            deQuien.textContent = "";

        }

        if (vacio) {

            vacio.textContent =
                "No tienes objetivos asignados, así que aquí no hay cifras tuyas.";

        }

        return;

    }

    if (deQuien) {

        deQuien.textContent =
            `Lo que llevas este trimestre. Son tus cifras: nadie más las ve.`;

    }

    const indicadores = [

        {
            clave: "cerrado",
            valor: euros(mias.cerrado),
            nombre: "Cerrado este trimestre",
            dice: "Lo firmado, sin impuestos"
        },

        {
            clave: "objetivo",
            valor: euros(mias.objetivo),
            nombre: "Tu objetivo",
            dice: "Lo que te toca este trimestre"
        },

        {
            clave: "cumplimiento",
            valor: `${String(mias.cumplimiento).replace(".", ",")} %`,
            nombre: "Cumplimiento",
            dice: "Lo cerrado entre tu objetivo"
        },

        {
            clave: "presupuestos",
            valor: String(mias.presupuestos),
            nombre: "Presupuestos tuyos",
            dice: "Los que llevas abiertos"
        }

    ];

    caja.innerHTML =

        indicadores.map(una => `

            <div class="indicador"
                 id="indicador-${escapar(una.clave)}"
                 aria-labelledby="indicadorNombre-${escapar(una.clave)}">

                <span class="indicadorValor" aria-hidden="true">${escapar(una.valor)}</span>

                <span class="indicadorNombre"
                      id="indicadorNombre-${escapar(una.clave)}">${escapar(una.nombre)}</span>

                <span class="indicadorDice" aria-hidden="true">${escapar(una.dice)}</span>

            </div>

        `).join("");

    if (vacio) {

        vacio.textContent = "";

    }

});
