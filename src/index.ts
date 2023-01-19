import { authenticate } from '@google-cloud/local-auth'
import { OAuth2Client } from 'google-auth-library'
import { drive_v3 } from 'googleapis'

const fs = require('fs').promises
const path = require('path')
const process = require('process')

const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

type FileList = drive_v3.Schema$FileList
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|undefined>}
 */
const loadSavedCredentialsIfExist = async (): Promise<OAuth2Client | undefined> => {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
const saveCredentials = async (client: OAuth2Client): Promise<void> => {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

/**
 * Load or request or authorization to call APIs.
 */
const authorize = async (): Promise<OAuth2Client> => {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  })
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
const listFiles = async (authClient: OAuth2Client) => {
  google.options({ auth: authClient });

  const drive = google.drive({ version: 'v3' })
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)'
  })

  const data: FileList = res.data
  const files = data.files
  if (!files || files?.length === 0) {
    console.log('No files found.')
    return
  }

  console.log('Files:')
  files.map((file) => {
    console.log(`${file.name} (${file.id})`)
  })
}

authorize().then(listFiles).catch(console.error)
