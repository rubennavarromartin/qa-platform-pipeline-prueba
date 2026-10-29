const UI = (() => {

    function renderRow(contact, posicion) {

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(contact.id, posicion)}

    <td>
        <a
            class="ficha"
            href="contacts.html?id=${contact.id}">
            ${contact.name}
        </a>
    </td>

    <td>${contact.company}</td>

    <td>${contact.email}</td>

    <td class="celda-editable">${EdicionEnLinea.celda({
        id: contact.id,
        campo: "phone",
        valor: contact.phone,
        etiqueta: "Teléfono"
    })}</td>

    <td>${Badge.status(contact.status)}</td>

    <td>

        <div class="action-buttons">


            <button
                class="btn-delete"
                data-id="${contact.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    /*
    * Dentro de esta tabla, no en toda la página: la pantalla
    * tiene también la tabla de documentos.
    */

    function bindEvents() {

        document
            .querySelectorAll("#contactsGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const contact =
                        Contacts.findById(id);

                    if (!contact) {

                        return;

                    }

                    const dependencias =
                        CrudPage.dependencias(contact);

                    if (dependencias.length) {

                        Toast.error(Relations.aviso(contact.name, dependencias)
                        );

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar el contacto "${contact.name}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }
                    Contacts.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    return {

        renderTable(contacts) {

            DataTable.render(
                "#contactsGrid tbody",
                /*
                * Con dónde va cada fila: los botones de colocar no están en
                * los extremos, y eso es lo que hace reconocible desde fuera
                * que sirven para colocar.
                */

                contacts.map((contact, i) => renderRow(contact, {
                    primera: i === 0,
                    ultima: i === contacts.length - 1
                }))
            );

            bindEvents();

            /*
            * Y el teléfono se puede cambiar sin abrir el formulario.
            *
            * Se engancha la tabla y no cada lápiz, así que da igual que esto
            * se llame en cada repintado: el componente se engancha una vez y
            * se acuerda.
            */

            EdicionEnLinea.enganchar("#contactsGrid", {

                leer: (id, campo) =>
                    Contacts.findById(id)?.[campo],

                guardar: (id, campo, valor) => {

                    const contacto =
                        Contacts.findById(id);

                    if (!contacto) {

                        return;

                    }

                    Contacts.update({ ...contacto, [campo]: valor });

                    CrudPage.pintar();

                    Toast.mostrar(`Teléfono de ${contacto.name} actualizado.`);

                }

            });

        }

    };

})();
