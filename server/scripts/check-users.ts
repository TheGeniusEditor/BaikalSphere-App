import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // First check column names
  const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
  const colNames = cols.rows.map((r: any) => r.column_name);
  console.log('Users table columns:', colNames.join(', '));

  const users = await pool.query('SELECT * FROM users ORDER BY email');
  console.log('\n=== Baikalsphere Users ===');
  for (const u of users.rows) {
    console.log(`  ${u.email} | display: ${u.display_name || u.name || 'N/A'} | role: ${u.platform_role} | id: ${u.id}`);
  }

  // List all tables
  const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
  console.log('\n=== Tables ===');
  for (const t of tables.rows) console.log(`  ${t.tablename}`);

  // Try to find module access - check for any table with 'module' in name
  for (const t of tables.rows) {
    if (t.tablename.includes('module') || t.tablename.includes('access')) {
      const cols2 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${t.tablename}' ORDER BY ordinal_position`);
      console.log(`\n  ${t.tablename} columns:`, cols2.rows.map((r:any)=>r.column_name).join(', '));
      const data = await pool.query(`SELECT * FROM "${t.tablename}" LIMIT 20`);
      console.log(`  ${t.tablename} data:`, JSON.stringify(data.rows, null, 2));
    }
  }

  await pool.end();
}
main();
