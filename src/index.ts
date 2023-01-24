import { drive_v3 } from 'googleapis'
import {
  client,
  generateToken,
  loadTokenIfExists,
  requestConsent,
  saveToken,
  setCredentials,
  validateOrRefreshClientCredentials
} from './auth/auth-client'
import { listFiles } from "./drive";
import { Config } from "./config";

const { google } = require('googleapis')

const SCOPES = ['profile', 'email', 'https://www.googleapis.com/auth/drive.metadata.readonly']

const main = async () => {
  // TODO refactor extract a method to return the oauth client
  try {
    const credentials = await loadTokenIfExists()
    await setCredentials(credentials)
    await validateOrRefreshClientCredentials()
  } catch (error) {
    console.error(error)
    const code = await requestConsent(SCOPES)
    const credentials = await generateToken(code)
    await setCredentials(credentials)
    await saveToken(credentials)
  }

  google.options({ auth: client })

  const emailOrigin = Config.EMAIL_SRC as string
  return listFiles(emailOrigin)
}

main().catch(console.error)
