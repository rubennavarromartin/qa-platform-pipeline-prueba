document.addEventListener("DOMContentLoaded", () => {

    /*
    * La dirección manda: con `?id=` se monta la ficha y nada
    * más. El listado no se monta, que no se ve.
    */

    if (RoleDetail.pedida()) {

        RoleDetail.create();

        return;

    }

    /*
    * Los usuarios, para saber al borrar si el rol lo tiene alguno.
    */

    Users.load();

    CrudPage.create({

        entity: "roles",

        repository: Roles,

        ui: RoleUI,

        form: RoleForm,

        searchId: "search",

        newButtonId: "newRoleButton",

        tabla: "#rolesGrid",

        columnas: [
            {},
            { titulo: "Rol", campo: "name" },
            { titulo: "Descripción", campo: "description" },
            { titulo: "Permisos" },
            { titulo: "Estado", campo: "status" },
            {}
        ],

        dependenciasDe: role => [

            {
                nombre: "usuarios",
                singular: "usuario",
                cuantos:
                    Users.findAll().filter(u => u.role === role.name).length
            }

        ]

    });


});
