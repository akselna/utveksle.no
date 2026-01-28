import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateBolognaImage() {
  const client = await pool.connect();
  
  try {
    const imageUrl = 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    
    const result = await client.query(`
      UPDATE universities 
      SET image_url = $1
      WHERE name IN (
        'Università degli Studi di Bologna',
        'Università di Bologna',
        'University of Bologna',
        'The University of Bologna'
      )
      RETURNING id, name, image_url;
    `, [imageUrl]);
    
    console.log(`✅ Updated ${result.rowCount} Bologna university entries:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.name} (ID: ${row.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating Bologna image:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateBolognaImage().catch(console.error);

