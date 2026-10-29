/*
|--------------------------------------------------------------------------
| Provinces
|--------------------------------------------------------------------------
|
| Provincias y sus municipios: el caso clásico de dos campos
| donde el segundo depende del primero.
|
| Está aquí y no en el formulario porque también hace falta al
| sembrar los datos y al pintar la ficha.
|
*/

const Provinces = (() => {

    const MUNICIPIOS = {

        "A Coruña": ["A Coruña", "Santiago de Compostela", "Ferrol"],

        "Alicante": ["Alicante", "Elche", "Benidorm"],

        "Barcelona": ["Barcelona", "Sabadell", "Terrassa"],

        "Cantabria": ["Santander", "Torrelavega", "Castro Urdiales"],

        "La Rioja": ["Logroño", "Haro", "Calahorra"],

        "Madrid": ["Madrid", "Alcalá de Henares", "Getafe"],

        "Málaga": ["Málaga", "Marbella", "Vélez-Málaga"],

        "Sevilla": ["Sevilla", "Dos Hermanas", "Alcalá de Guadaíra"],

        "Valencia": ["Valencia", "Gandía", "Torrent"],

        "Valladolid": ["Valladolid", "Medina del Campo", "Laguna de Duero"],

        "Vizcaya": ["Bilbao", "Getxo", "Barakaldo"],

        "Zaragoza": ["Zaragoza", "Calatayud", "Utebo"]

    };

    return {

        nombres() {

            return Object.keys(MUNICIPIOS);

        },

        municipiosDe(provincia) {

            return MUNICIPIOS[provincia] || [];

        },

        /*
        * A qué provincia pertenece un municipio. Hace falta para
        * abrir la ficha de una empresa que sólo tiene guardada la
        * ciudad.
        */

        provinciaDe(municipio) {

            return Object.keys(MUNICIPIOS).find(p =>
                MUNICIPIOS[p].includes(municipio)
            ) || null;

        }

    };

})();
