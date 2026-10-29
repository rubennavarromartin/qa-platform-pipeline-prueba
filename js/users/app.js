document.addEventListener("DOMContentLoaded", () => {

    /*
    * La dirección manda: con `?id=` se monta la ficha y nada
    * más. El listado no se monta, que no se ve.
    */

    if (UserDetail.pedida()) {

        UserDetail.create();

        return;

    }

    CrudPage.create({

        entity: "users",

        repository: Users,

        ui: UserUI,

        form: UserForm,

        searchId: "search",

        newButtonId: "newUserButton",

        tabla: "#usersGrid",

        columnas: [
            {},
            { titulo: "Usuario", campo: "name" },
            { titulo: "Email", campo: "email" },
            { titulo: "Rol", campo: "role" },
            { titulo: "Estado", campo: "status" },
            {}
        ]

    });


});
