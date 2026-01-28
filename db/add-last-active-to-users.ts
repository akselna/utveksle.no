import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function addLastActiveToUsers() {
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

  if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL is not set');
      process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    // Look for file in correct locations
    const sqlPath = path.join(process.cwd(), 'utveksling_app/db', 'add-last-active-to-users.sql');
    const sqlPath2 = path.join(process.cwd(), 'db', 'add-last-active-to-users.sql');
    
    let sql = '';
    if (fs.existsSync(sqlPath)) {
        sql = fs.readFileSync(sqlPath, 'utf8');
    } else if (fs.existsSync(sqlPath2)) {
        sql = fs.readFileSync(sqlPath2, 'utf8');
    } else {
        throw new Error(`Could not find sql file at ${sqlPath} or ${sqlPath2}`);
    }

    console.log('Adding last_active column to users table...');
    await pool.query(sql);
    console.log('Successfully added last_active column.');

  } catch (error) {
    console.error('Error adding last_active column:', error);
  } finally {
      await pool.end();
  }
}

addLastActiveToUsers();
