// Environment variable validation
export function validateEnv() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GEMINI_API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`)
    
    // During build time, we'll allow missing vars but log warnings
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      console.log('Build-time environment check - some variables may be set during deployment')
      return false
    }
  }

  return missingVars.length === 0
}

// Default values for build time
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'placeholder-secret',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder-key'
} 