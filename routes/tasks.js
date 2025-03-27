const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET /tasks : récupérer toutes les tâches avec filtres et tris
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Filtres
    if (req.query.statut) query.statut = req.query.statut;
    if (req.query.priorite) query.priorite = req.query.priorite;
    if (req.query.categorie) query.categorie = req.query.categorie;
    if (req.query.etiquette) query.etiquettes = req.query.etiquette;
    if (req.query.apres) query.echeance = { $gte: new Date(req.query.apres) };
    if (req.query.avant) query.echeance = { $lte: new Date(req.query.avant) };
    if (req.query.q) {
      query.$or = [
        { titre: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];
    }

    let tasksQuery = Task.find(query);

    // Tri
    if (req.query.tri) {
      const ordre = req.query.ordre === "desc" ? -1 : 1;
      let tri = {};
      tri[req.query.tri] = ordre;
      tasksQuery = tasksQuery.sort(tri);
    }

    const tasks = await tasksQuery.exec();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id : récupérer une tâche par son identifiant
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks : créer une nouvelle tâche
router.post("/", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /tasks/:id : modifier une tâche existante
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /tasks/:id : supprimer une tâche
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.json({ message: "Tâche supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks/:id/sousTaches : ajouter une sous-tâche
router.post("/:id/sousTaches", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    // req.body doit contenir { titre, statut, echeance }
    task.sousTaches.push(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /tasks/:id/sousTaches/:sousTacheId : modifier une sous-tâche
router.put("/:id/sousTaches/:sousTacheId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    const sousTache = task.sousTaches.id(req.params.sousTacheId);
    if (!sousTache)
      return res.status(404).json({ message: "Sous-tâche non trouvée" });

    // Mettre à jour les champs de la sous-tâche
    sousTache.set(req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /tasks/:id/sousTaches/:sousTacheId : supprimer une sous-tâche
router.delete("/:id/sousTaches/:sousTacheId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    task.sousTaches.id(req.params.sousTacheId).remove();
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /tasks/:id/commentaires : ajouter un commentaire
router.post("/:id/commentaires", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    // req.body doit contenir { auteur: { nom, prenom, email }, contenu }
    task.commentaires.push(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /tasks/:id/commentaires/:commentaireId : modifier un commentaire
router.put("/:id/commentaires/:commentaireId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    const commentaire = task.commentaires.id(req.params.commentaireId);
    if (!commentaire)
      return res.status(404).json({ message: "Commentaire non trouvé" });

    commentaire.set(req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /tasks/:id/commentaires/:commentaireId : supprimer un commentaire
router.delete("/:id/commentaires/:commentaireId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    task.commentaires.id(req.params.commentaireId).remove();
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
