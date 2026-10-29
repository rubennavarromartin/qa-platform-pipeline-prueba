/*
|--------------------------------------------------------------------------
| Informes
|--------------------------------------------------------------------------
|
| Dos cifras contadas de los repositorios, y nada más. La pantalla no existe
| por lo que enseña: existe por **cómo se llega a ella**.
|
| Es la única sección del laboratorio que está en el menú lateral y **no tiene
| tarjeta con `data-module`** en la pantalla de entrada. El porqué entero está
| en `informes.html`, y en una frase: los módulos se descubrían buscando ese
| atributo, que sólo existe aquí porque se le puso a mano, y hacía falta un
| caso puesto a propósito para comprobar que se reconoce una sección que nadie
| anuncia.
|
| Las cifras se cuentan a los repositorios y no a lo guardado, que es lección
| vieja de esta casa: en un navegador recién abierto —que es como arranca cada
| prueba— lo guardado está vacío y los contadores decían cero teniendo catorce
| empresas.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const caja =
        document.getElementById("indicadoresInformes");

    if (!caja) {

        return;

    }

    const escapar =
        texto => String(texto).replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c]);

    const cuantos =
        repositorio => {

            try {

                return (repositorio.findAll() || []).length;

            }
            catch (error) {

                return 0;

            }

        };

    const indicadores = [

        {
            clave: "empresas",
            valor: String(cuantos(Companies)),
            nombre: "Empresas en el catálogo",
            dice: "Todas, activas y de baja"
        },

        {
            clave: "contactos",
            valor: String(cuantos(Contacts)),
            nombre: "Contactos registrados",
            dice: "De todas las empresas"
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

    /*
    * Las de la forma de SABESP. Lo que importa de ellas está en
    * `informes.html`: que no hay ningún identificador, y que lo único que las
    * distingue es el atributo del componente que las envuelve.
    */

    const cuentas =
        document.querySelector('[data-cuadro="cuentas"]');

    if (cuentas) {

        cuentas.innerHTML =

            [
                {
                    titulo: "Usuarios con acceso",
                    valor: String(cuantos(Users)),
                    unidad: "personas",
                    dice: "Activos y de baja"
                },
                {
                    titulo: "Roles definidos",
                    valor: String(cuantos(Roles)),
                    unidad: "roles",
                    dice: "Con sus permisos por módulo"
                }
            ].map(una => `

                <lab-indicador titulo="${escapar(una.titulo)}">

                    <article class="indicador">

                        <span class="indicadorNombre">${escapar(una.titulo)}</span>

                        <div class="indicadorValor">
                            ${escapar(una.valor)} <small>${escapar(una.unidad)}</small>
                        </div>

                        <span class="indicadorDice">${escapar(una.dice)}</span>

                    </article>

                </lab-indicador>

            `).join("");

    }

    /*
    * La gráfica de lienzo: empresas, contactos, usuarios y roles, una barra
    * cada uno. Se pinta
    * a mano con el contexto 2D, que es lo que hace Chart.js por debajo, para
    * que en el documento no quede nada que leer.
    */

    const lienzo =
        document.getElementById("graficaInformes");

    const pincel =
        lienzo?.getContext?.("2d");

    if (pincel) {

        const barras =
            [cuantos(Companies), cuantos(Contacts), cuantos(Users), cuantos(Roles)];

        const alto =
            Math.max(...barras, 1);

        pincel.fillStyle = "#2c6fbb";

        barras.forEach((valor, cual) => {

            const altura =
                Math.round((valor / alto) * 140);

            pincel.fillRect(30 + cual * 110, 150 - altura, 70, altura);

        });

    }

    /*
    * El dial: el porcentaje de empresas activas, dibujado y dicho. Las dos
    * cosas salen del mismo número, que es lo que se comprueba.
    */

    const dial =
        document.querySelector(".dial .dial-dibujo");

    if (dial) {

        const todas =
            (() => { try { return Companies.findAll() || []; } catch { return []; } })();

        const activas =
            todas.filter(una => una.status === "Activo").length;

        const porcentaje =
            todas.length ? Math.round((activas / todas.length) * 100) : 0;

        dial.setAttribute("aria-valuenow", String(porcentaje));

        dial.querySelector(".dial-texto").textContent = `${porcentaje}%`;

        dial.querySelector(".dial-arco")
            .setAttribute("stroke-dasharray", `${(porcentaje / 100) * 252} 252`);

    }

    /*
    * Simular: se calcula aquí y se manda a guardar, como hace SABESP con sus
    * estudios. El resultado se pinta haya contestado el servidor o no, porque
    * el de SABESP también lo enseña; lo que importa es que la petición sale.
    */

    document.getElementById("simularTrimestre")
        ?.addEventListener("click", () => {

            const estudio = {
                empresas: cuantos(Companies),
                contactos: cuantos(Contacts),
                cuando: new Date().toISOString()
            };

            fetch("api/simulaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(estudio)
            })
                .catch(() => {})
                .finally(() => {

                    const resultado =
                        document.getElementById("simulacionResultado");

                    if (resultado) {

                        resultado.textContent =
                            `Con ${estudio.empresas} empresas y ${estudio.contactos} ` +
                            `contactos, el trimestre cierra como el anterior.`;

                    }

                });

        });

    /*
    * Imprimir, como lo hace Meristec: la hoja se monta al empezar a imprimir y
    * se quita al acabar, se imprima o se cancele. Es lo que la plataforma
    * tiene que dejar pasar sin colgarse y sin dejar la hoja puesta; el porqué,
    * en `informes.html`.
    */

    window.addEventListener("beforeprint", () => {

        const hoja = document.createElement("section");

        hoja.id = "hojaImpresion";

        hoja.innerHTML =
            `<h1>Resumen del catálogo</h1>` +
            indicadores.map(una => `<p>${escapar(una.nombre)}: ${escapar(una.valor)}</p>`).join("");

        document.body.appendChild(hoja);

        document.body.classList.add("imprimiendo");

    });

    window.addEventListener("afterprint", () => {

        document.getElementById("hojaImpresion")?.remove();

        document.body.classList.remove("imprimiendo");

    });

    document.getElementById("imprimirInforme")
        ?.addEventListener("click", () => window.print());

});
