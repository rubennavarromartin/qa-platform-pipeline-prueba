/*
* La ficha de un usuario. Es la más sencilla: no tiene nada
* colgando, y por eso su pestaña de Datos es la única.
*/

const UserDetail = (() => {

    return {

        pedida() {

            return Detail.pedida();

        },

        create() {

            const registro =
                Detail.create({

                entidad:
                    "Usuario",

                repositorio:
                    Users,

                titulo:
                    user => user.name,

                datos:
                    user => [

                        ["Usuario", user.name],

                        ["Email", user.email],

                        ["Rol", user.role],

                        ["Estado", Badge.status(user.status)]

                    ],

                editar:
                    registro => UserForm.open(registro)

            });

            /*
            * Los documentos son de este registro, no del módulo.
            */

            if (registro) {

                Documents.create({

                    modulo: "usuarios",

                    registro: registro.id,

                    titulo: registro.name

                });

                /*
                * Y los comentarios, que son de este registro por el
                * mismo motivo que los documentos: lo que alguien anotó
                * sobre un registro es de ese registro, no del módulo.
                */

                Comments.create({

                    modulo: "usuarios",

                    registro: registro.id

                });

            }

        }

    };

})();
