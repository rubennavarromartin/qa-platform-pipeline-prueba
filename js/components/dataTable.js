const DataTable = (() => {

    function render(containerId, rows) {

        document
            .querySelector(containerId)
            .innerHTML = rows.join("");

    }

    return {

        render

    };

})();
