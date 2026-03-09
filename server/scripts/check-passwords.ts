import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Check if passwords exist for all users
  const result = await pool.query(`
    SELECT email, 
           CASE WHEN password_hash IS NOT NULL AND password_hash != '' THEN 'YES' ELSE 'NO' END as has_password,
           platform_role
    FROM users 
    ORDER BY email
  `);
  
  console.log('=== Password Status ===');
  let withPwd = 0, withoutPwd = 0;
  for (const r of result.rows) {
    const status = r.has_password === 'YES' ? '✓' : '✗ NO PASSWORD';
    if (r.has_password === 'YES') withPwd++; else withoutPwd++;
    console.log(`  ${status} ${r.email} (${r.platform_role})`);
  }
  console.log(`\nTotal: ${withPwd} with password, ${withoutPwd} without password`);

  await pool.end();
}
main();
