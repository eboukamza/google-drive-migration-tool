import {
  authorize
} from "./auth/auth-client";
import { listFiles } from "./drive";
import { Config } from "./config";

const { google } = require('googleapis')

const SCOPES = ['profile', 'email', 'https://www.googleapis.com/auth/drive.metadata.readonly']

const main = async () => {

  const client = await authorize(SCOPES)
  google.options({ auth: client })

  const emailOrigin = Config.EMAIL_SRC as string
  return listFiles(emailOrigin)
}

main().catch(console.error)
