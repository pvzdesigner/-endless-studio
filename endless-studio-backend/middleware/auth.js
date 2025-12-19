const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'endless-studio-secret-key';

module.exports = function(req, res, next) {
  // Obter token do header
  const token = req.header('x-auth-token');
  
  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar usuário ao request
    req.user = decoded;
    
    // Verificar se é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
    }
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};