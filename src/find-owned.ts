import { google } from 'googleapis'

import { authorize } from './auth/auth-client'
import { driveUtils } from './drive'

const findOwnedFiles = async (email: string) => {
  const SCOPES = ['email', 'https://www.googleapis.com/auth/drive']

  const client = await authorize(SCOPES)
  google.options({ auth: client })

  return driveUtils.listAllOwnedFiles(email)
}

export { findOwnedFiles }
