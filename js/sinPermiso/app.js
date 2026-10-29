/*
|--------------------------------------------------------------------------
| La pantalla de sin permiso
|--------------------------------------------------------------------------
|
| Dice de qué pantalla se viene, que es lo único que añade sobre el título.
| Sale de la dirección —?desde=users.html— porque quien trae aquí es la
| pantalla que se ha negado, y para cuando esto se monta ya no está.
|
| No se fía de lo que venga en la dirección para escribirlo en la página: se
| busca entre los módulos que hay, y lo que no esté no se dice. Meter en el
| documento un texto que viene de la barra de direcciones es la manera
| clásica de abrir un agujero, y un laboratorio también se escribe bien.
|
*/

document.addEventListener("DOMContentLoaded", () => {
    const desde =
        new URLSearchParams(location.search).get("desde");

    const modulo =
        Layout.MODULOS.find(uno => uno.href === desde);

    const detalle =
        document.getElementById("sinPermisoDetalle");

    if (detalle) {

        detalle.textContent =
            modulo
                ? `${modulo.nombre} es una pantalla de administración, y tu rol no llega.`
                : "Tu rol no llega a la pantalla que has pedido.";

    }

    document
        .getElementById("volverAlInicioButton")
        ?.addEventListener("click", () => {

            location.href = "index.html";

        });

});
