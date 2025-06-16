import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { users, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, firstName, lastName } = await request.json()

    if (action === 'login') {
      // Find user by email
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1)
      
      if (!user.length) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const foundUser = user[0]
      
      // Check password
      if (foundUser.passwordHash && !await bcrypt.compare(password, foundUser.passwordHash)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Create session token
      const token = jwt.sign(
        { userId: foundUser.id, email: foundUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Save session to database
      await db.insert(sessions).values({
        userId: foundUser.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

      return NextResponse.json({
        user: {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          avatar: foundUser.avatar
        },
        token
      })
    }

    if (action === 'register') {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      
      if (existingUser.length) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const newUser = await db.insert(users).values({
        email,
        firstName,
        lastName,
        passwordHash,
        avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=3B82F6&color=fff`
      }).returning()

      // Create session token
      const token = jwt.sign(
        { userId: newUser[0].id, email: newUser[0].email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Save session to database
      await db.insert(sessions).values({
        userId: newUser[0].id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

      return NextResponse.json({
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          avatar: newUser[0].avatar
        },
        token
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}