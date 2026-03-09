require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  const r = await p.query(`
    SELECT u.id, u.email, u.platform_role 
    FROM users u 
    JOIN user_modules um ON um.user_id = u.id 
    WHERE um.module_id = 'ar' 
    ORDER BY u.email
  `);
  for (const x of r.rows) {
    console.log(x.email, '|', x.platform_role, '|', x.id.substring(0,8) + '...');
  }
  console.log('\nTotal Baikalsphere users with AR module:', r.rowCount);
  await p.end();
})();
