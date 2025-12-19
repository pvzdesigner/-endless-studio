const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Configuração das variáveis de ambiente
dotenv.config();

// Inicializar app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://seu-site.com'], // Adicione seu domínio
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/endless-studio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// Importar rotas
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');

// Usar rotas
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Endless Studio está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Servir frontend (se estiver no mesmo servidor)
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});