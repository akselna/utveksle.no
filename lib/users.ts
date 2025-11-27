import { query } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  study_program?: string;
  specialization?: string;
  study_year?: string;
  university?: string;
  provider?: string;
  verified: boolean;
}

export interface CreateUserData {
  email: string;
  password?: string;
  name: string;
  study_program?: string;
  specialization?: string;
  study_year?: string;
  university?: string;
  google_id?: string;
  provider: 'credentials' | 'google';
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, study_program, specialization, study_year, university, provider, verified
     FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, study_program, specialization, study_year, university, provider, verified
     FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, study_program, specialization, study_year, university, provider, verified
     FROM users WHERE google_id = $1`,
    [googleId]
  );

  return result.rows[0] || null;
}

// Verify user password
export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, password_hash, study_program, specialization, study_year, university, provider, verified
     FROM users WHERE email = $1 AND provider = 'credentials'`,
    [email]
  );

  const user = result.rows[0];
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  // Return user without password_hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Create new user
export async function createUser(data: CreateUserData): Promise<User> {
  // Check if user already exists
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  let passwordHash = null;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  const result = await query(
    `INSERT INTO users
     (email, password_hash, name, study_program, specialization, study_year, university, google_id, provider)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, email, name, study_program, specialization, study_year, university, provider, verified`,
    [
      data.email,
      passwordHash,
      data.name,
      data.study_program || null,
      data.specialization || null,
      data.study_year || null,
      data.university || 'NTNU',
      data.google_id || null,
      data.provider
    ]
  );

  return result.rows[0];
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  updates: Partial<Pick<User, 'name' | 'study_program' | 'specialization' | 'study_year' | 'university'>>
): Promise<User> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.study_program !== undefined) {
    fields.push(`study_program = $${paramIndex++}`);
    values.push(updates.study_program);
  }
  if (updates.specialization !== undefined) {
    fields.push(`specialization = $${paramIndex++}`);
    values.push(updates.specialization);
  }
  if (updates.study_year !== undefined) {
    fields.push(`study_year = $${paramIndex++}`);
    values.push(updates.study_year);
  }
  if (updates.university !== undefined) {
    fields.push(`university = $${paramIndex++}`);
    values.push(updates.university);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, email, name, study_program, specialization, study_year, university, provider, verified`,
    values
  );

  return result.rows[0];
}
