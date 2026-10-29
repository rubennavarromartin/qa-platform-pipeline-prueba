const Badge = (() => {

    /*
    * Cada estado con su color. Lo que no esté aquí sale en gris,
    * que es lo que hacía antes con todo lo que no fuera "Activo".
    */

    const COLORES = {

        "Activo": "active",
        "Realizada": "active",

        "Pendiente": "pending",

        "Inactivo": "inactive",
        "Cancelada": "inactive",

        /*
        * Los estados de un presupuesto. En verde sólo el que
        * cierra bien: los tres que quedan por delante son
        * "todavía no" y los dos que cierran mal, gris. Pintar de
        * verde "entregado" haría creer que está ganado.
        */

        "Aceptado": "active",
        "Creado": "pending",
        "Entregado": "pending",
        "Rechazado": "inactive",
        "Cancelado": "inactive"

    };

    function status(status) {

        const cssClass =
            COLORES[status] || "inactive";

        return `
            <span class="badge ${cssClass}">
                ${status}
            </span>
        `;

    }

    return {

        status

    };

})();
