const CompanyUI = (() => {

    function renderRow(company) {

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(company.id)}

    <td>
        <a
            class="ficha"
            href="companies.html?id=${company.id}">
            ${company.name}
        </a>
    </td>

    <td>${company.taxId}</td>

    <td>${company.city}</td>

    <td>${Badge.status(company.status)}</td>

    <td>

        <div class="action-buttons">


            <button
                class="btn-delete"
                data-id="${company.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    /*
    * Los botones se buscan dentro de esta tabla y no en toda la
    * página: desde que hay pestañas, la pantalla tiene también
    * la tabla de documentos, y sus botones son otros.
    */

    function bindEvents() {

        document
            .querySelectorAll("#companiesGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const company =
                        Companies.findById(id);

                    if (!company) {

                        return;

                    }

                    const dependencias =
                        CrudPage.dependencias(company);

                    if (dependencias.length) {

                        Toast.error(Relations.aviso(company.name, dependencias)
                        );

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar la empresa "${company.name}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }
                    Companies.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    /*
    * Las dos tarjetas de arriba, y son un caso montado a propósito.
    *
    * "Empresas a la vista" cuenta las filas que se están viendo, así que baja
    * al buscar. "En el catálogo" enseña el total y no se mueve — que es lo
    * que hace el contador de un menú, y lo que la plataforma tiene que
    * aprender a NO tomar por un contador de filas.
    *
    * Las dos se llaman "Empresas" en su nombre, y ésa es la trampa: quien
    * empareje por el texto se las lleva las dos.
    */

    function pintarLasTarjetas(aLaVista) {

        const alaVista =
            document.getElementById("cifraALaVista");

        const total =
            document.getElementById("cifraEnElCatalogo");

        if (alaVista) {

            alaVista.querySelector(".indicadorValor").textContent = aLaVista;

        }

        if (total) {

            total.querySelector(".indicadorValor").textContent =
                Companies.findAll().length;

        }

        /*
        * Y la que se queda pegada al primer valor: se escribe una vez y no se
        * vuelve a tocar. Es el fallo que la prueba de coherencia tiene que
        * cazar, montado a propósito.
        */

        const listadas =
            document.getElementById("cifraListadas");

        if (listadas && !listadas.dataset.puesta) {

            listadas.querySelector(".indicadorValor").textContent = aLaVista;

            listadas.dataset.puesta = "sí";

        }

    }

    return {

        renderTable(companies) {

            DataTable.render(
              "#companiesGrid tbody",
              companies.map(renderRow)
          );

            pintarLasTarjetas(companies.length);

            bindEvents();

        }

    };

})();
