// Variable globale pour stocker le contenu initial du modal
let originalModalHTML = "";
let currentTaskId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Stocker le contenu initial du modal
  const modal = document.getElementById("detail-modal");
  originalModalHTML = modal.innerHTML;

  // Attacher l'événement de fermeture du modal
  attachModalCloseEvent();

  // Récupération initiale des tâches
  fetchTasks();

  // Gestion du formulaire de création de tâche
  const taskForm = document.getElementById("task-form");
  taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const titre = document.getElementById("titre").value;
    const description = document.getElementById("description").value;
    const echeance = document.getElementById("echeance").value;
    const statut = document.getElementById("statut").value;
    const priorite = document.getElementById("priorite").value;
    const categorie = document.getElementById("categorie").value;
    const etiquettesInput = document.getElementById("etiquettes").value;

    const etiquettes = etiquettesInput
      ? etiquettesInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : [];

    const taskData = {
      titre,
      description,
      echeance: echeance ? new Date(echeance) : null,
      statut,
      priorite,
      categorie,
      etiquettes,
    };

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la tâche");
      }

      taskForm.reset();
      fetchTasks();
    } catch (error) {
      console.error("Erreur:", error);
    }
  });

  // Gestion du formulaire de filtrage
  const filterForm = document.getElementById("filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const statut = document.getElementById("filter-statut").value;
      const priorite = document.getElementById("filter-priorite").value;
      const categorie = document.getElementById("filter-categorie").value;
      const etiquette = document.getElementById("filter-etiquette").value;
      const avant = document.getElementById("filter-avant").value;
      const apres = document.getElementById("filter-apres").value;
      const q = document.getElementById("filter-q").value;

      let url = "/tasks?";
      if (statut) url += `statut=${encodeURIComponent(statut)}&`;
      if (priorite) url += `priorite=${encodeURIComponent(priorite)}&`;
      if (categorie) url += `categorie=${encodeURIComponent(categorie)}&`;
      if (etiquette) url += `etiquette=${encodeURIComponent(etiquette)}&`;
      if (avant) url += `avant=${encodeURIComponent(avant)}&`;
      if (apres) url += `apres=${encodeURIComponent(apres)}&`;
      if (q) url += `q=${encodeURIComponent(q)}&`;

      fetchTasks(url);
    });
  }

  // Gestion du formulaire de tri
  const sortForm = document.getElementById("sort-form");
  if (sortForm) {
    sortForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const tri = document.getElementById("tri").value;
      const ordre = document.getElementById("ordre").value;

      let url = "/tasks?";
      const statut = document.getElementById("filter-statut").value;
      const priorite = document.getElementById("filter-priorite").value;
      if (statut) url += `statut=${encodeURIComponent(statut)}&`;
      if (priorite) url += `priorite=${encodeURIComponent(priorite)}&`;
      if (tri) {
        url += `tri=${encodeURIComponent(tri)}&ordre=${encodeURIComponent(ordre)}`;
      }
      fetchTasks(url);
    });
  }
});

// Fonction pour attacher l'événement de fermeture du modal et restaurer son contenu initial
function attachModalCloseEvent() {
  const modal = document.getElementById("detail-modal");
  const closeBtn = modal.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      currentTaskId = null;
      // Restaurer le contenu initial du modal
      modal.innerHTML = originalModalHTML;
      attachModalCloseEvent();
    });
  }
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      currentTaskId = null;
      modal.innerHTML = originalModalHTML;
      attachModalCloseEvent();
    }
  });
}

// Fonction pour récupérer et afficher une tâche dans le modal
async function fetchTask(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la tâche");
    }
    const task = await response.json();
    currentTaskId = taskId; // mémorise l'ID de la tâche sélectionnée

    const modalTaskInfo = document.getElementById("modal-task-info");
    modalTaskInfo.innerHTML = `
      <h3>${task.titre}</h3>
      <p>${task.description}</p>
      <p>Statut: ${task.statut}</p>
      <p>Priorité: ${task.priorite}</p>
      <p>Échéance: ${task.echeance ? new Date(task.echeance).toLocaleDateString() : "Non défini"}</p>
      <p>Catégorie: ${task.categorie ? task.categorie : "Non défini"}</p>
      <p>Étiquettes: ${task.etiquettes && task.etiquettes.length > 0 ? task.etiquettes.join(", ") : "Aucune"}</p>
    `;

    // Afficher la liste des sous-tâches dans le modal
    const modalSousTachesList = document.getElementById(
      "modal-sous-taches-list"
    );
    modalSousTachesList.innerHTML = "";
    if (task.sousTaches && task.sousTaches.length > 0) {
      task.sousTaches.forEach((st) => {
        const li = document.createElement("li");
        li.textContent = `${st.titre} - ${st.statut} - ${st.echeance ? new Date(st.echeance).toLocaleDateString() : "Non défini"}`;
        modalSousTachesList.appendChild(li);
      });
    } else {
      modalSousTachesList.innerHTML = "<li>Aucune sous-tâche</li>";
    }

    // Afficher la liste des commentaires dans le modal
    const modalCommentairesList = document.getElementById(
      "modal-commentaires-list"
    );
    modalCommentairesList.innerHTML = "";
    if (task.commentaires && task.commentaires.length > 0) {
      task.commentaires.forEach((com) => {
        const li = document.createElement("li");
        li.textContent = `${com.auteur.nom} ${com.auteur.prenom} (${new Date(com.date).toLocaleDateString()}): ${com.contenu}`;
        modalCommentairesList.appendChild(li);
      });
    } else {
      modalCommentairesList.innerHTML = "<li>Aucun commentaire</li>";
    }

    // Ouvrir le modal
    document.getElementById("detail-modal").style.display = "block";

    // Attacher les événements sur les boutons d'édition et de suppression
    const editBtn = document.getElementById("edit-task-btn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        openEditModal(currentTaskId);
      });
    }
    const deleteBtn = document.getElementById("delete-task-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        deleteTask(currentTaskId);
      });
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour récupérer et afficher toutes les tâches
async function fetchTasks(url = "/tasks") {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des tâches");
    }
    const tasks = await response.json();

    const container = document.getElementById("tasks-container");
    container.innerHTML = tasks
      .map(
        (task) => `
      <div class="task" data-id="${task._id}">
        <h3>${task.titre}</h3>
        <p>${task.description}</p>
        <p>Statut: ${task.statut}</p>
        <p>Priorité: ${task.priorite}</p>
        <p>Échéance: ${task.echeance ? new Date(task.echeance).toLocaleDateString() : "Non défini"}</p>
        <p>Catégorie: ${task.categorie ? task.categorie : "Non défini"}</p>
        <p>Étiquettes: ${task.etiquettes && task.etiquettes.length > 0 ? task.etiquettes.join(", ") : "Aucune"}</p>
      </div>
    `
      )
      .join("");

    attachTaskDetailListeners();
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Attacher les écouteurs sur chaque tâche pour ouvrir le modal
function attachTaskDetailListeners() {
  const taskElements = document.querySelectorAll(".task");
  taskElements.forEach((taskEl) => {
    taskEl.addEventListener("click", () => {
      const taskId = taskEl.getAttribute("data-id");
      fetchTask(taskId);
    });
  });
}

// Fonction pour ajouter une sous-tâche à une tâche
async function addSousTache(taskId, data) {
  try {
    const response = await fetch(`/tasks/${taskId}/sousTaches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout de la sous-tâche");
    }
    fetchTask(taskId);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour ajouter un commentaire à une tâche
async function addCommentaire(taskId, data) {
  try {
    const response = await fetch(`/tasks/${taskId}/commentaires`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du commentaire");
    }
    fetchTask(taskId);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Écouteur pour le formulaire de sous-tâche dans le modal
document
  .getElementById("modal-sous-tache-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentTaskId) return alert("Aucune tâche sélectionnée.");

    const titre = document.getElementById("modal-sous-tache-titre").value;
    const statut = document.getElementById("modal-sous-tache-statut").value;
    const echeanceValue = document.getElementById(
      "modal-sous-tache-echeance"
    ).value;
    const echeance = echeanceValue ? new Date(echeanceValue) : null;

    addSousTache(currentTaskId, { titre, statut, echeance });
    e.target.reset();
  });

// Écouteur pour le formulaire de commentaire dans le modal
document
  .getElementById("modal-commentaire-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentTaskId) return alert("Aucune tâche sélectionnée.");

    const auteur = {
      nom: document.getElementById("modal-commentaire-auteur-nom").value,
      prenom: document.getElementById("modal-commentaire-auteur-prenom").value,
      email: document.getElementById("modal-commentaire-auteur-email").value,
    };
    const contenu = document.getElementById("modal-commentaire-contenu").value;

    addCommentaire(currentTaskId, { auteur, contenu });
    e.target.reset();
  });

// Fonction pour ouvrir le formulaire d'édition dans le modal
async function openEditModal(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}`);
    if (!response.ok)
      throw new Error(
        "Erreur lors de la récupération de la tâche pour modification"
      );
    const task = await response.json();

    const editFormHTML = `
      <form id="edit-task-form">
        <div class="form-group">
          <label for="edit-titre">Titre :</label>
          <input type="text" id="edit-titre" name="titre" value="${task.titre}" required />
        </div>
        <div class="form-group">
          <label for="edit-description">Description :</label>
          <textarea id="edit-description" name="description">${task.description}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-echeance">Date d'échéance :</label>
          <input type="date" id="edit-echeance" name="echeance" value="${task.echeance ? new Date(task.echeance).toISOString().substr(0, 10) : ""}" />
        </div>
        <div class="form-group">
          <label for="edit-statut">Statut :</label>
          <select id="edit-statut" name="statut">
            <option value="à faire" ${task.statut === "à faire" ? "selected" : ""}>À faire</option>
            <option value="en cours" ${task.statut === "en cours" ? "selected" : ""}>En cours</option>
            <option value="terminée" ${task.statut === "terminée" ? "selected" : ""}>Terminée</option>
            <option value="annulée" ${task.statut === "annulée" ? "selected" : ""}>Annulée</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-priorite">Priorité :</label>
          <select id="edit-priorite" name="priorite">
            <option value="basse" ${task.priorite === "basse" ? "selected" : ""}>Basse</option>
            <option value="moyenne" ${task.priorite === "moyenne" ? "selected" : ""}>Moyenne</option>
            <option value="haute" ${task.priorite === "haute" ? "selected" : ""}>Haute</option>
            <option value="critique" ${task.priorite === "critique" ? "selected" : ""}>Critique</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-categorie">Catégorie :</label>
          <input type="text" id="edit-categorie" name="categorie" value="${task.categorie ? task.categorie : ""}" />
        </div>
        <div class="form-group">
          <label for="edit-etiquettes">Étiquettes :</label>
          <input type="text" id="edit-etiquettes" name="etiquettes" value="${task.etiquettes ? task.etiquettes.join(", ") : ""}" placeholder="séparez par des virgules" />
        </div>
        <button type="submit" class="btn">Enregistrer les modifications</button>
      </form>
    `;
    // Remplacer le contenu du modal par le formulaire d'édition
    const modalContent = document.querySelector("#detail-modal .modal-content");
    modalContent.innerHTML =
      `<span class="close">&times;</span>` + editFormHTML;

    // Ré-attacher l'événement de fermeture
    const closeBtn = modalContent.querySelector(".close");
    closeBtn.addEventListener("click", () => {
      document.getElementById("detail-modal").style.display = "none";
      currentTaskId = null;
      // Restaurer le contenu initial du modal
      document.getElementById("detail-modal").innerHTML = originalModalHTML;
      attachModalCloseEvent();
    });

    // Gestion de la soumission du formulaire d'édition
    document
      .getElementById("edit-task-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const titre = document.getElementById("edit-titre").value;
        const description = document.getElementById("edit-description").value;
        const echeance = document.getElementById("edit-echeance").value;
        const statut = document.getElementById("edit-statut").value;
        const priorite = document.getElementById("edit-priorite").value;
        const categorie = document.getElementById("edit-categorie").value;
        const etiquettesInput =
          document.getElementById("edit-etiquettes").value;
        const etiquettes = etiquettesInput
          ? etiquettesInput
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag !== "")
          : [];

        const updatedTask = {
          titre,
          description,
          echeance: echeance ? new Date(echeance) : null,
          statut,
          priorite,
          categorie,
          etiquettes,
        };

        try {
          const response = await fetch(`/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
          });
          if (!response.ok) {
            throw new Error("Erreur lors de la modification de la tâche");
          }
          document.getElementById("detail-modal").style.display = "none";
          // Restaurer le contenu initial du modal
          document.getElementById("detail-modal").innerHTML = originalModalHTML;
          attachModalCloseEvent();
          fetchTasks();
        } catch (error) {
          console.error("Erreur:", error);
        }
      });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour supprimer une tâche
async function deleteTask(taskId) {
  if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la tâche");
    }
    document.getElementById("detail-modal").style.display = "none";
    // Restaurer le contenu initial du modal
    document.getElementById("detail-modal").innerHTML = originalModalHTML;
    attachModalCloseEvent();
    fetchTasks();
  } catch (error) {
    console.error("Erreur:", error);
  }
}
