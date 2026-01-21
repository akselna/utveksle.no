import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function addRoleToUsers() {
  // Simple .env loader
  try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
          const envConfig = fs.readFileSync(envPath, 'utf8');
          envConfig.split('\n').forEach(line => {
              const [key, value] = line.split('=');
              if (key && value && !process.env[key.trim()]) {
                  process.env[key.trim()] = value.trim();
              }
          });
      }
  } catch (e) {
      console.log('Could not load .env.local');
  }

  if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    const sqlPath = path.join(process.cwd(), 'utveksling_app/db', 'add-role-to-users.sql');
    // Fallback if running from root
    const sqlPath2 = path.join(process.cwd(), 'db', 'add-role-to-users.sql');
    
    let sql = '';
    if (fs.existsSync(sqlPath)) {
        sql = fs.readFileSync(sqlPath, 'utf8');
    } else if (fs.existsSync(sqlPath2)) {
        sql = fs.readFileSync(sqlPath2, 'utf8');
    } else {
        throw new Error(`Could not find sql file at ${sqlPath} or ${sqlPath2}`);
    }

    console.log('Adding role column to users table...');
    await pool.query(sql);
    console.log('Successfully added role column.');

  } catch (error) {
    console.error('Error adding role column:', error);
  } finally {
      await pool.end();
  }
}

addRoleToUsers();