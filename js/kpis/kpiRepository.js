/*
|--------------------------------------------------------------------------
| Mis cifras
|--------------------------------------------------------------------------
|
| Los objetivos de cada comercial y lo que lleva cerrado.
|
| Van por usuario y no por rol: los objetivos son de una persona.
| Cada uno ve **los suyos**, y la pantalla no ofrece manera de ver
| los de otro — que es lo que la hace un caso distinto de las
| demás listas del laboratorio, donde todo el mundo ve las mismas
| catorce filas.
|
| Los datos están sembrados y no se calculan de los presupuestos
| a propósito: un presupuesto del laboratorio no tiene dueño, y
| repartirlos por usuario a base de suposiciones sería inventarse
| el dato que la pantalla enseña.
|
| Lo que sí se calcula es el cumplimiento —lo cerrado entre el
| objetivo—, y eso es a propósito: es una cifra que sale de otras
| dos que están a la vista, que es justo lo que la plataforma sabe
| deducir.
|
*/

const MisCifras = (() => {

    const STORAGE_KEY = "qa-platform-mis-cifras";

    /*
    * Lo de cada uno. Quien no esté aquí no tiene objetivos: no es
    * un cero, es que ese usuario no vende.
    */

    const cifras = {

        ana: {
            objetivo: 120000,
            cerrado: 84500,
            presupuestos: 7,
            visitas: 23
        },

        luis: {
            objetivo: 90000,
            cerrado: 96200,
            presupuestos: 9,
            visitas: 31
        },

        pablo: {
            objetivo: 90000,
            cerrado: 41800,
            presupuestos: 4,
            visitas: 12
        },

        marta: {
            objetivo: 60000,
            cerrado: 55100,
            presupuestos: 5,
            visitas: 18
        }

    };

    return {

        load() {

            const guardado =
                localStorage.getItem(STORAGE_KEY);

            if (!guardado) {

                this.save();

                return;

            }

            Object.assign(cifras, JSON.parse(guardado));

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cifras)
            );

        },

        /*
        * Las de quien ha entrado. Sin sesión no hay cifras que
        * enseñar: son de alguien, no de la aplicación.
        */

        mias() {

            const quien =
                typeof Session !== "undefined"
                    ? Session.actual()?.username
                    : null;

            const suyas =
                quien ? cifras[quien] : null;

            if (!suyas) {

                return null;

            }

            return {

                quien,

                ...suyas,

                /*
                * El cumplimiento sale de las otras dos, y se
                * redondea a una décima: un 70,4166666 % en una
                * tarjeta no lo lee nadie.
                */

                cumplimiento:
                    Math.round(suyas.cerrado / suyas.objetivo * 1000) / 10

            };

        }

    };

})();
