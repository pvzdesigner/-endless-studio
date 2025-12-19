const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { check, validationResult } = require('express-validator');

// Middleware de autenticação
const authenticate = require('../middleware/auth');

// GET todos os projetos
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// GET projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// POST criar novo projeto (apenas admin)
router.post('/', [
  authenticate,
  check('designer', 'Nome do designer é obrigatório').not().isEmpty(),
  check('projectName', 'Nome do projeto é obrigatório').not().isEmpty(),
  check('category', 'Categoria é obrigatória').not().isEmpty(),
  check('imageUrl', 'URL da imagem é obrigatória').not().isEmpty(),
  check('description', 'Descrição é obrigatória').not().isEmpty()
], async (req, res) => {
  try {
    // Validar dados
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { designer, projectName, category, imageUrl, description } = req.body;
    
    // Criar novo projeto
    const project = new Project({
      designer,
      projectName,
      category,
      imageUrl,
      description
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      project
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// PUT atualizar projeto (apenas admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { designer, projectName, category, imageUrl, description } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Atualizar campos
    project.designer = designer || project.designer;
    project.projectName = projectName || project.projectName;
    project.category = category || project.category;
    project.imageUrl = imageUrl || project.imageUrl;
    project.description = description || project.description;
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      project
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// DELETE remover projeto (apenas admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    await project.deleteOne();
    
    res.json({
      success: true,
      message: 'Projeto removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover projeto:', error);
    res.status(500).json({ error: 'Erro ao remover projeto' });
  }
});

module.exports = router;