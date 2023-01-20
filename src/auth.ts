import { auth, OAuth2Client } from 'google-auth-library'
import { promises as fs } from 'fs'
import path from 'path'
import { authenticate } from '@google-cloud/local-auth'
import process from 'process'

const TOKEN_PATH = path.join(__dirname, '../token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')
// If modifying these scopes, delete token.json.
const SCOPES = ['profile', 'email', 'https://www.googleapis.com/auth/drive.metadata.readonly']

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|undefined>}
 */
const loadSavedCredentialsIfExist = async (): Promise<OAuth2Client | undefined> => {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    return auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
const saveCredentials = async (client: OAuth2Client): Promise<void> => {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
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
    console.log('client saved')
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

export { authorize, loadSavedCredentialsIfExist }
