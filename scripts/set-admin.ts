import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function setAdmin() {
  // Load .env.local
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

  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: npx tsx scripts/set-admin.ts <email>');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    console.log(`Setting user ${email} as admin...`);
    
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role`,
      [email]
    );

    if (result.rowCount === 0) {
      console.error(`User with email ${email} not found.`);
    } else {
      console.log(`User ${email} is now an admin.`);
      console.log(result.rows[0]);
    }

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
      await pool.end();
  }
}

setAdmin();
