const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  designer: {
    type: String,
    required: [true, 'Nome do designer é obrigatório'],
    trim: true
  },
  projectName: {
    type: String,
    required: [true, 'Nome do projeto é obrigatório'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: ['logo', 'banner', 'gif', 'flyer', 'loadscreen', 'letreiro', 'motion']
  },
  imageUrl: {
    type: String,
    required: [true, 'URL da imagem é obrigatória']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar updatedAt antes de salvar
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;