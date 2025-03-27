const mongoose = require("mongoose");

const SousTacheSchema = new mongoose.Schema({
  titre: String,
  statut: String,
  echeance: Date,
});

const CommentaireSchema = new mongoose.Schema({
  auteur: {
    nom: String,
    prenom: String,
    email: String,
  },
  date: { type: Date, default: Date.now },
  contenu: String,
});

const ModificationSchema = new mongoose.Schema({
  champModifie: String,
  ancienneValeur: mongoose.Schema.Types.Mixed,
  nouvelleValeur: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  dateCreation: { type: Date, default: Date.now },
  echeance: Date,
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },
  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
  },
  auteur: {
    nom: String,
    prenom: String,
    email: String,
  },
  categorie: String,
  etiquettes: [String],
  sousTaches: [SousTacheSchema],
  commentaires: [CommentaireSchema],
  historiqueModifications: [ModificationSchema],
});

module.exports = mongoose.model("Task", TaskSchema);
