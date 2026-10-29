/*
|--------------------------------------------------------------------------
| Los códigos de los presupuestos
|--------------------------------------------------------------------------
|
| Un presupuesto se identifica por su código, y hasta ahora el laboratorio
| dejaba crear dos con el mismo. Eso es un fallo de la aplicación —el código
| es lo que se cita en un correo y lo que se busca en la rejilla— y a la vez
| es un caso que la plataforma no tenía: un campo obligatorio que además es
| **único**, y que viene propuesto por la propia aplicación.
|
| Cómo se compone
|
|     PRE - 2026 - 015
|      │      │      │
|      │      │      └── contador, tres cifras, y avanza al crear
|      │      └───────── ejercicio
|      └──────────────── prefijo, tres alfanuméricos
|
| El contador es **de cada ejercicio**, no de la instalación. Es como se
| numeran los presupuestos de verdad: al entrar en 2027 se vuelve a empezar
| por el 1, y el 2026 se queda como estaba. Un contador único obligaría a
| que el primero de 2027 fuera el 15 porque en 2026 se hicieron catorce.
|
| Lo que se propone y lo que se acepta son dos cosas
|
|   Al crear se propone el siguiente, y se puede cambiar a mano. Si el que
|   se pone ya existe, no se guarda: se avisa y se propone **el hueco más
|   cercano hacia arriba**. Con el 1, el 2 y el 4 creados, el contador está
|   en 4 y propone el 5; si alguien escribe el 1, se le dice que no se
|   puede repetir y se le ofrece el 3.
|
| Cuándo avanza el contador, y cuándo no
|
|   Sólo hacia arriba, y sólo cuando el código guardado lo pasa. Escribir el
|   3 —un hueco— no mueve el contador, que sigue en 4: si lo bajara, el
|   siguiente presupuesto volvería a chocar con el 4. Escribir el 6 sí lo
|   mueve al 6, y el siguiente será el 7.
|
|   Y al borrar el último —el que tiene justo el número del contador— el
|   contador resta uno, para que el hueco que se acaba de abrir sea el que
|   se ofrezca. Sólo el último: borrar el 2 no puede bajar el contador a 1,
|   porque el 4 sigue ahí.
|
| Los códigos de otros ejercicios y de otros prefijos no estorban: cada
| serie se cuenta sola. Y la unicidad se mira sobre el código entero, que es
| lo que no se puede repetir.
|
*/

const Codigos = (() => {

    /*
    * Cuántas cifras lleva el contador. Tres, como los catorce que hay
    * sembrados. No es un tope: el presupuesto mil se llamará 1000, porque
    * cortar el número sería inventar un código.
    */

    const CIFRAS = 3;

    const PREFIJO_POR_DEFECTO = "PRE";

    /*
    * Los ejercicios que se pueden elegir: cinco atrás y dos adelante desde
    * el año en curso. Adelante hacen falta: un presupuesto de diciembre
    * para el año que viene se numera del año que viene.
    */

    function ejercicios() {

        const ahora =
            new Date().getFullYear();

        const anos = [];

        for (let ano = ahora - 5; ano <= ahora + 2; ano++) {

            anos.push(ano);

        }

        return anos;

    }

    /*
    * Los ajustes, con el respaldo puesto: esta pantalla puede abrirse antes
    * de que nadie haya entrado en Configuración.
    */

    function ajustes() {

        const guardados =
            typeof Settings !== "undefined"
                ? Settings.todos()
                : {};

        return {

            prefijo:
                limpiarPrefijo(guardados.presupuestoPrefijo),

            ejercicio:
                Number(guardados.presupuestoEjercicio) ||
                    new Date().getFullYear(),

            contadores:
                guardados.presupuestoContadores &&
                typeof guardados.presupuestoContadores === "object"
                    ? guardados.presupuestoContadores
                    : {}

        };

    }

    /*
    * El prefijo: tres alfanuméricos y en mayúsculas. Lo que no cumpla se
    * corrige en lugar de rechazarse, porque esto también se llama al leer
    * lo guardado y un prefijo inválido dejaría la aplicación sin poder
    * proponer ningún código.
    */

    function limpiarPrefijo(texto) {

        const limpio =
            String(texto || "")
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 3);

        return limpio.length === 3
            ? limpio
            : PREFIJO_POR_DEFECTO;

    }

    /*
    * Un código, desmenuzado. Devuelve nulo si no tiene esta forma: los
    * códigos escritos a mano antes de que existiera esto pueden no tenerla,
    * y no cuentan para ninguna serie.
    */

    function desmenuzar(codigo) {

        const partes =
            String(codigo || "").trim().match(/^([A-Za-z0-9]{3})-(\d{4})-(\d+)$/);

        if (!partes) {

            return null;

        }

        return {

            prefijo:
                partes[1].toUpperCase(),

            ejercicio:
                Number(partes[2]),

            numero:
                Number(partes[3])

        };

    }

    function componer(prefijo, ejercicio, numero) {

        return `${limpiarPrefijo(prefijo)}-${ejercicio}-${
            String(numero).padStart(CIFRAS, "0")
        }`;

    }

    /*
    * Los códigos que ya existen. Se piden al repositorio, que los lee de lo
    * guardado: así funciona también desde otra pantalla que no haya cargado
    * los presupuestos en memoria.
    */

    function existentes() {

        return typeof Quotes !== "undefined"
            ? Quotes.codigos()
            : [];

    }

    /*
    * Los números usados de una serie —un prefijo y un ejercicio—, ordenados.
    */

    function usados(prefijo, ejercicio) {

        return existentes()

            .map(desmenuzar)

            .filter(uno =>
                uno &&
                uno.prefijo === limpiarPrefijo(prefijo) &&
                uno.ejercicio === Number(ejercicio)
            )

            .map(uno => uno.numero)

            .sort((uno, otro) => uno - otro);

    }

    return {

        CIFRAS,

        PREFIJO_POR_DEFECTO,

        ejercicios,

        limpiarPrefijo,

        desmenuzar,

        componer,

        ajustes,

        /*
        * En qué número va una serie.
        *
        * El guardado si lo hay; y si no, el más alto que exista, que es lo
        * que hace que esto funcione desde el primer día sin que nadie haya
        * entrado en Configuración: con los catorce presupuestos sembrados,
        * el contador de 2026 es 14 sin que nadie lo escriba.
        */

        contador(ejercicio = ajustes().ejercicio, prefijo = ajustes().prefijo) {

            const guardado =
                ajustes().contadores[String(ejercicio)];

            if (Number.isInteger(Number(guardado)) && Number(guardado) >= 0) {

                return Number(guardado);

            }

            const suyos =
                usados(prefijo, ejercicio);

            return suyos.length
                ? suyos[suyos.length - 1]
                : 0;

        },

        /*
        * El código que se propone al crear: el siguiente del contador. Y si
        * ése estuviera cogido —porque alguien lo escribió a mano antes— el
        * primer hueco por encima.
        */

        siguiente(ejercicio = ajustes().ejercicio, prefijo = ajustes().prefijo) {

            return componer(
                prefijo,
                ejercicio,
                this.primerHuecoDesde(this.contador(ejercicio, prefijo) + 1, ejercicio, prefijo)
            );

        },

        /*
        * El primer número libre desde uno dado, contando hacia arriba.
        */

        primerHuecoDesde(numero, ejercicio = ajustes().ejercicio, prefijo = ajustes().prefijo) {

            const cogidos =
                new Set(usados(prefijo, ejercicio));

            let cual =
                Math.max(1, Number(numero) || 1);

            while (cogidos.has(cual)) {

                cual++;

            }

            return cual;

        },

        /*
        * Si un código está cogido. Se compara el código entero y sin
        * distinguir mayúsculas: "pre-2026-001" y "PRE-2026-001" son el
        * mismo, y dejar los dos sería dejar el duplicado por la puerta de
        * atrás.
        *
        * `salvo` es el identificador del presupuesto que se está editando:
        * su propio código no choca consigo mismo.
        */

        estaCogido(codigo, salvo = null) {

            const cual =
                String(codigo || "").trim().toUpperCase();

            if (!cual) {

                return false;

            }

            /*
            * Se piden al repositorio los códigos con su identificador, y no
            * `findAll`, porque esto se llama también desde el formulario de
            * otra pantalla: `conId` lee de lo guardado.
            */

            return (
                typeof Quotes !== "undefined"
                    ? Quotes.codigosConId()
                    : []
            ).some(
                uno => String(uno.code || "").trim().toUpperCase() === cual &&
                    String(uno.id) !== String(salvo)
            );

        },

        /*
        * Qué ofrecer cuando el código que alguien ha escrito ya existe: el
        * hueco más cercano hacia arriba de su propia serie.
        *
        * Si el código no tiene la forma de una serie —alguien ha escrito
        * "presupuesto de Bosonit"— no hay hueco que ofrecer y se devuelve
        * el siguiente de la serie de partida, que es mejor que nada.
        */

        elHuecoDe(codigo) {

            const suyo =
                desmenuzar(codigo);

            if (!suyo) {

                return this.siguiente();

            }

            return componer(
                suyo.prefijo,
                suyo.ejercicio,
                this.primerHuecoDesde(suyo.numero + 1, suyo.ejercicio, suyo.prefijo)
            );

        },

        /*
        * Al guardar un presupuesto: si su código pasa del contador de su
        * serie, el contador avanza hasta él.
        *
        * Sólo hacia arriba. Escribir un hueco no puede bajar el contador,
        * porque el siguiente presupuesto volvería a chocar con lo que ya
        * hay más arriba.
        */

        avanzarHasta(codigo) {

            const suyo =
                desmenuzar(codigo);

            if (!suyo || typeof Settings === "undefined") {

                return;

            }

            if (suyo.numero <= this.contador(suyo.ejercicio, suyo.prefijo)) {

                return;

            }

            this.guardarContador(suyo.ejercicio, suyo.numero);

        },

        /*
        * Y al borrar: si el que se va es justo el del contador, el contador
        * resta uno para que su hueco sea el que se ofrezca.
        *
        * Se resta hasta el primero libre hacia abajo y no de uno en uno a
        * ciegas: borrar el último de "1, 2, 5" deja el contador en 2, que
        * es donde estaría si el 5 no hubiera existido nunca.
        */

        retrocederPor(codigo) {

            const suyo =
                desmenuzar(codigo);

            if (!suyo || typeof Settings === "undefined") {

                return;

            }

            if (suyo.numero !== this.contador(suyo.ejercicio, suyo.prefijo)) {

                return;

            }

            const quedan =
                usados(suyo.prefijo, suyo.ejercicio)
                    .filter(numero => numero !== suyo.numero);

            this.guardarContador(
                suyo.ejercicio,
                quedan.length ? quedan[quedan.length - 1] : 0
            );

        },

        guardarContador(ejercicio, numero) {

            const suyos =
                { ...ajustes().contadores };

            suyos[String(ejercicio)] =
                Math.max(0, Number(numero) || 0);

            Settings.guardar({ presupuestoContadores: suyos });

        }

    };

})();
