/*
* La ficha de un rol: sus permisos y los usuarios que lo tienen.
*
* Esa segunda pestaña es la que hace falta para poder decir, al
* borrar, que un rol con usuarios no se puede borrar: quien lo
* intente tiene dónde mirar quiénes son.
*/

const RoleDetail = (() => {

    function usuariosDe(role) {

        Users.load();

        const suyos =
            Users.findAll()
                .filter(u => u.role === role.name);

        RelatedTable.render({

            nombre:
                "Usuarios",

            titulo:
                `Usuarios con el rol ${role.name}`,

            columnas:
                ["Usuario", "Email", "Estado"],

            registros:
                suyos,

            fila:
                user => [

                    Detail.enlace("users.html", user.id, user.name),

                    user.email,

                    Badge.status(user.status)

                ],

            vacio:
                `Ningún usuario tiene el rol ${role.name}.`

        });

    }

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            const registro =
                Detail.create({

                entidad:
                    "Rol",

                repositorio:
                    Roles,

                titulo:
                    role => role.name,

                datos:
                    role => [

                        ["Rol", role.name],

                        ["Descripción", role.description],

                        ["Permisos",
                            (role.permissions || []).join(", ") || "—"],

                        ["Estado", Badge.status(role.status)]

                    ],

                alCargar:
                    usuariosDe,

                editar:
                    registro => RoleForm.open(registro)

            });

            /*
            * Los documentos son de este registro, no del módulo.
            */

            if (registro) {

                Documents.create({

                    modulo: "roles",

                    registro: registro.id,

                    titulo: registro.name

                });

                /*
                * Y los comentarios, que son de este registro por el
                * mismo motivo que los documentos: lo que alguien anotó
                * sobre un registro es de ese registro, no del módulo.
                */

                Comments.create({

                    modulo: "roles",

                    registro: registro.id

                });

            }

        }

    };

})();
