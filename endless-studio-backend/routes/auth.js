const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Config = require('../models/Config');
const { check, validationResult } = require('express-validator');

// Chave secreta JWT (use variável de ambiente em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'endless-studio-secret-key';

// POST login
router.post('/login', [
  check('username', 'Username é obrigatório').not().isEmpty(),
  check('password', 'Senha é obrigatória').not().isEmpty()
], async (req, res) => {
  try {
    // Validar dados
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password } = req.body;
    
    // Buscar usuário
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Criar token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST configurar Discord link (apenas admin)
router.post('/config/discord', async (req, res) => {
  try {
    const { discordLink } = req.body;
    
    if (!discordLink) {
      return res.status(400).json({ error: 'Link do Discord é obrigatório' });
    }
    
    // Buscar ou criar configuração
    let config = await Config.findOne();
    
    if (!config) {
      config = new Config({ discordLink });
    } else {
      config.discordLink = discordLink;
      config.updatedAt = Date.now();
    }
    
    await config.save();
    
    res.json({
      success: true,
      message: 'Link do Discord atualizado com sucesso',
      config
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

// GET obter configurações
router.get('/config', async (req, res) => {
  try {
    let config = await Config.findOne();
    
    if (!config) {
      config = await Config.create({});
    }
    
    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// POST criar usuário admin inicial (rota de setup)
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verificar se já existe admin
    const existingAdmin = await User.findOne({ isAdmin: true });
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin já configurado' });
    }
    
    // Criar admin
    const admin = new User({
      username,
      password,
      isAdmin: true
    });
    
    await admin.save();
    
    // Criar configuração padrão
    await Config.create({});
    
    res.json({
      success: true,
      message: 'Admin criado com sucesso'
    });
  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;