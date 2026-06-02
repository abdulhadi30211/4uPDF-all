import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = createToken({
      email,
      name: 'Admin',
      role: 'admin'
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
