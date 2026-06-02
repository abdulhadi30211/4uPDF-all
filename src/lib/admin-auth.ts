import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || '4updf-admin-secret-key-2024-secure-hadi'
const ADMIN_EMAIL = 'preabdulhadi@gmail.com'
const ADMIN_PASSWORD = 'Fg@112233@Hadi'

export interface AdminSession {
  email: string
  name: string
  role: string
}

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export function createToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}
