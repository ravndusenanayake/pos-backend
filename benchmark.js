const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-juice-bar-pos-key-change-this-in-production';
const token = jwt.sign({ userId: 1, email: 'admin@juicebar.com', role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '1d' });

async function testEndpoint(name, path) {
  const start = Date.now();
  try {
    const res = await fetch(`http://localhost:3000${path}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.text();
    const end = Date.now();
    console.log(`[${name}] ${path} - Status: ${res.status} - Time: ${end - start}ms - Size: ${data.length} bytes`);
  } catch (err) {
    const end = Date.now();
    console.error(`[${name}] ${path} - Failed - Time: ${end - start}ms - Error: ${err.message}`);
  }
}

async function runTests() {
  console.log('--- Starting API Performance Tests ---');
  await testEndpoint('Stats', '/api/sales/stats');
  await testEndpoint('Sales', '/api/sales');
  await testEndpoint('Products', '/api/products');
  await testEndpoint('Categories', '/api/categories');
  await testEndpoint('Users', '/api/users');
  console.log('--- Finished API Performance Tests ---');
}

runTests();
