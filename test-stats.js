const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-juice-bar-pos-key-change-this-in-production';
const token = jwt.sign({ userId: 1, email: 'admin@juicebar.com', role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '1d' });

fetch('http://localhost:3000/api/sales/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
