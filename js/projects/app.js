document.addEventListener("DOMContentLoaded", () => {

    /*
    * Con `?id=` se monta la ficha y nada más, igual que en las demás
    * pantallas con ficha: el listado no se monta porque no se ve.
    */

    if (ProjectDetail.pedida()) {

        ProjectDetail.create();

        return;

    }

    /*
    * El catálogo de estados y las empresas, que es de donde salen las dos
    * columnas que no son del proyecto.
    */

    ProjectStatuses.load();

    Tasks.load();

    if (typeof Companies !== "undefined") {

        Companies.load();

    }

    CrudPage.create({

        entity: "projects",

        repository: Projects,

        ui: ProjectUI,

        form: ProjectForm,

        searchId: "search",

        newButtonId: "newProjectButton",

        tabla: "#projectsGrid",

        columnas: [
            { titulo: "Proyecto", campo: "name" },
            { titulo: "Empresa", campo: "companyId" },
            { titulo: "Estado", campo: "statusId" },
            { titulo: "Entrega", campo: "dueDate" },
            { titulo: "Avance", campo: "avance" },
            {}
        ]

    });

});
