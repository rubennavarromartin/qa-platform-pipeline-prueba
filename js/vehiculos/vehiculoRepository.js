/*
|--------------------------------------------------------------------------
| Vehículos
|--------------------------------------------------------------------------
|
| Los vehículos de la flota. Lo que importa de esta pantalla no son sus
| datos sino cómo se da de alta uno: el porqué, en `vehiculos.html`.
|
| Doce de partida, para que la rejilla pagine a diez como las demás: un
| alta que cae en la segunda página es lo que hace que una prueba tenga
| que pedir que se enseñen todos antes de contar.
|
*/

const Vehiculos = (() => {

    const STORAGE_KEY = "qa-platform-vehiculos";

    const vehiculos = [
        { id: 1,  matricula: "1234 KLM", marca: "Renault",    modelo: "Kangoo",  matriculacion: "2021-03-12", flota: "FL-1023" },
        { id: 2,  matricula: "2345 LMN", marca: "Peugeot",    modelo: "Partner", matriculacion: "2020-07-01", flota: "FL-2047" },
        { id: 3,  matricula: "3456 MNP", marca: "Citroën",    modelo: "Berlingo", matriculacion: "2022-01-19", flota: "FL-3051" },
        { id: 4,  matricula: "4567 NPR", marca: "Ford",       modelo: "Transit", matriculacion: "2019-11-05", flota: "FL-4086" },
        { id: 5,  matricula: "5678 PRS", marca: "Volkswagen", modelo: "Caddy",   matriculacion: "2023-02-27", flota: "FL-5112" },
        { id: 6,  matricula: "6789 RST", marca: "Fiat",       modelo: "Doblò",   matriculacion: "2018-09-14", flota: "FL-6139" },
        { id: 7,  matricula: "7890 STV", marca: "Opel",       modelo: "Combo",   matriculacion: "2021-06-30", flota: "FL-7164" },
        { id: 8,  matricula: "8901 TVW", marca: "Toyota",     modelo: "Proace",  matriculacion: "2022-10-08", flota: "FL-8190" },
        { id: 9,  matricula: "9012 VWX", marca: "Nissan",     modelo: "NV200",   matriculacion: "2020-04-22", flota: "FL-9215" },
        { id: 10, matricula: "0123 WXY", marca: "Mercedes",   modelo: "Vito",    matriculacion: "2023-08-16", flota: "FL-1243" },
        { id: 11, matricula: "1357 XYZ", marca: "Iveco",      modelo: "Daily",   matriculacion: "2019-05-03", flota: "FL-2276" },
        { id: 12, matricula: "2468 BCD", marca: "Dacia",      modelo: "Dokker",  matriculacion: "2024-01-11", flota: "FL-3308" }
    ];

    /*
    | Cada vehículo lleva su código de flota: "FL-" y cuatro cifras. Es
    | obligatorio en el alta y no se admite de otra forma, y no se dice en
    | ningún sitio cuál es: sólo se ve en el listado. Es la pregunta de
    | "aprender el formato de los registros que ya hay": un valor genérico no
    | pasa, y el único sitio del que se puede sacar es lo que ya está dado de
    | alta.
    */

    const DE_PARTIDA =
        vehiculos.map(uno => ({ ...uno }));

    return {

        load() {

            const guardado =
                localStorage.getItem(STORAGE_KEY);

            if (!guardado) {

                this.save();

                return;

            }

            vehiculos.length = 0;

            vehiculos.push(...JSON.parse(guardado));

        },

        save() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(vehiculos)
            );

        },

        findAll() {

            return [...vehiculos];

        },

        search(texto) {

            const busca =
                String(texto || "").trim().toLowerCase();

            if (!busca) {

                return this.findAll();

            }

            return vehiculos.filter(uno =>
                [uno.matricula, uno.marca, uno.modelo]
                    .some(trozo => String(trozo).toLowerCase().includes(busca))
            );

        },

        create(datos) {

            const vehiculo = {

                id:
                    vehiculos.reduce((alto, uno) => Math.max(alto, uno.id), 0) + 1,

                matricula:
                    String(datos.matricula || "").trim().toUpperCase(),

                flota:
                    String(datos.flota || "").trim(),

                marca:
                    String(datos.marca || "").trim(),

                modelo:
                    String(datos.modelo || "").trim(),

                matriculacion:
                    datos.matriculacion || ""

            };

            vehiculos.push(vehiculo);

            this.save();

            if (window.ActivityLog) {

                ActivityLog.anotar({
                    entidad:  "Vehículo",
                    accion:   ActivityLog.ACCIONES.ALTA,
                    registro: vehiculo.matricula,
                    id:       vehiculo.id
                });

            }

            return vehiculo;

        },

        reset() {

            vehiculos.length = 0;

            vehiculos.push(...DE_PARTIDA.map(uno => ({ ...uno })));

            this.save();

        }

    };

})();
