const Modal = (() => {

    function create(content) {

        const overlay = document.createElement("div");

        overlay.className = "modal-overlay";

        overlay.innerHTML = `

<div class="modal">

${content}

</div>

`;

        document.body.appendChild(overlay);

        return overlay;

    }

    return {

        open(content) {

            this.close();

            return create(content);

        },

        close() {

            const modal = document.querySelector(".modal-overlay");

            if (modal) {

                modal.remove();

                /*
                * Se avisa de que el diálogo se ha cerrado. Quien
                * esté enseñando el registro que se acaba de tocar
                * necesita repintarse, y no tiene otra forma de
                * enterarse: guardar y cancelar cierran igual.
                *
                * Se avisa también al cancelar. Repintar lo mismo
                * no cuesta nada; distinguirlo obligaría a que
                * cada formulario lo contara, y son cinco.
                */

                document.dispatchEvent(
                    new CustomEvent("modal-cerrado")
                );

            }

        }

    };

})();
