/*
* La ficha de un presupuesto: su cabecera, sus líneas con el
* totalizador, y las citas que se han concertado para él.
*
* Las líneas se enseñan aquí en tabla de lectura, no editables. Para
* cambiarlas se entra al formulario por el botón Editar, que es
* donde vive la edición desde que se trasladó a la ficha.
*/

const QuoteDetail = (() => {

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function euros(importe) {

        return `${(Number(importe) || 0).toFixed(2)} €`;

    }

    function fecha(iso) {

        if (!iso) {

            return "";

        }

        const [ano, mes, dia] = String(iso).split("-");

        return `${dia}/${mes}/${ano}`;

    }

    /*
    * Las líneas y el pie.
    *
    * El pie va en el `tfoot` de la misma tabla y no en un cuadro
    * aparte: son las cuentas de estas líneas, y separarlos permitiría
    * que enseñaran cosas distintas.
    */

    function lineasDe(quote) {

        const cuerpo =
            document.getElementById("fichaLineasBody");

        const pie =
            document.getElementById("fichaLineasPie");

        if (!cuerpo || !pie) {

            return;

        }

        cuerpo.innerHTML =

            (quote.lines || [])

                .map(linea => `
<tr>
    <td>${escapar(linea.description)}</td>
    <td class="importe">${linea.units}</td>
    <td class="importe">${euros(linea.price)}</td>
    <td class="importe">${linea.discount} %</td>
    <td class="importe">${euros(Quotes.totalDeLinea(linea))}</td>
</tr>`)

                .join("");

        const totales =
            Quotes.totales(quote);

        pie.innerHTML = `
<tr>
    <th colspan="4">Suma de líneas</th>
    <td class="importe" id="fichaSuma">${euros(totales.suma)}</td>
</tr>
<tr>
    <th colspan="4">Descuento al pie (${quote.discount || 0} %)</th>
    <td class="importe" id="fichaDescuento">${euros(totales.descuento)}</td>
</tr>
<tr>
    <th colspan="4">Base imponible</th>
    <td class="importe" id="fichaBase">${euros(totales.base)}</td>
</tr>
<tr>
    <th colspan="4">IVA (${Quotes.iva()} %)</th>
    <td class="importe" id="fichaIva">${euros(totales.iva)}</td>
</tr>
<tr class="total">
    <th colspan="4">Total presupuesto</th>
    <td class="importe" id="fichaTotal">${euros(totales.total)}</td>
</tr>`;

        /*
        * El encabezado dice de quién son las líneas, como el de las
        * citas dice de quién son las citas.
        *
        * No es un adorno: una ficha que enseñara siempre el primer
        * registro tendría los datos de uno y los paneles de otro, y
        * lo único que lo delata es que cada panel se nombre. Con un
        * título fijo —"Líneas y totales"— ese fallo pasaría
        * desapercibido.
        */

        const titulo =
            document.getElementById("fichaLineasTitulo");

        if (titulo) {

            titulo.textContent =
                `Líneas de ${quote.code}`;

        }

        const vacio =
            document.getElementById("fichaLineasVacio");

        if (vacio) {

            vacio.textContent =
                `${quote.code} no tiene líneas.`;

            vacio.hidden = (quote.lines || []).length > 0;

        }

        const tabla =
            document.getElementById("fichaLineasGrid");

        if (tabla) {

            tabla.hidden = (quote.lines || []).length === 0;

        }

    }

    /*
    * Las citas concertadas para este presupuesto: presentarlo,
    * negociarlo, cerrarlo.
    */

    function citasDe(quote) {

        Appointments.load();

        RelatedTable.render({

            nombre:
                "Citas",

            titulo:
                `Citas de ${quote.code}`,

            columnas:
                ["Asunto", "Fecha", "Hora", "Contacto", "Estado"],

            registros:
                Appointments.findByQuote(quote.code),

            fila:
                cita => [

                    Detail.enlace("agenda.html", cita.id, cita.subject),

                    cita.date,

                    cita.time,

                    cita.contact,

                    Badge.status(cita.status)

                ],

            vacio:
                `${quote.code} no tiene citas.`

        });

        /*
        * Y el alta desde aquí.
        *
        * Se engancha en cada pintado y con `onclick` en lugar de
        * `addEventListener`: la ficha se repinta cada vez que se
        * cierra un diálogo, y con un enganche que se suma cada
        * vez, guardar dos citas seguidas abriría dos
        * formularios.
        *
        * La cita nace con el presupuesto y la empresa puestos, y
        * el contacto en blanco: lo elige quien la concierta, de
        * entre los de esa empresa.
        */

        const boton =
            document.getElementById("nuevaCitaButton");

        if (boton && typeof AppointmentForm !== "undefined") {

            boton.onclick = () => {

                AppointmentForm.open({

                    company: quote.company,

                    quote: quote.code

                });

            };

        }

    }

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            const registro =
                Detail.create({

                    entidad:
                        "Presupuesto",

                    repositorio:
                        Quotes,

                    titulo:
                        quote => quote.code,

                    datos:
                        quote => [

                            ["Código", quote.code],

                            [
                                "Empresa",
                                Detail.enlace(
                                    "companies.html",
                                    Companies.findAll()
                                        .find(c => c.name === quote.company)?.id,
                                    quote.company
                                )
                            ],

                            ["Fecha de creación", fecha(quote.createdAt)],

                            ["Estado", Badge.status(quote.status)],

                            ["Total", euros(Quotes.totales(quote).total)]

                        ],

                    alCargar:
                        quote => {

                            lineasDe(quote);

                            citasDe(quote);

                        },

                    editar:
                        quote => QuoteForm.open(quote)

                });

            if (registro) {

                Documents.create({

                    modulo: "presupuestos",

                    registro: registro.id,

                    titulo: registro.code

                });

                Comments.create({

                    modulo: "presupuestos",

                    registro: registro.id

                });

            }

        }

    };

})();
