import * as dotenv from 'dotenv'
dotenv.config()

const Config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
  EMAIL_SRC: process.env.EMAIL_SRC || '',
  MIGRATION_SOURCE: process.env.MIGRATION_SOURCE || '',
  MIGRATION_DEST: process.env.MIGRATION_DEST || ''
}

export { Config }
