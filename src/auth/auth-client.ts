import { Credentials, OAuth2Client } from 'google-auth-library'
import { promises as fs } from 'fs'
import path from 'path'
import * as http from 'http'
import url from 'url'
import open from 'open'
import { Config } from '../config'

const destroyer = require('server-destroy')

const TOKEN_PATH = path.join(__dirname, '../../token.json')

const createOAuthClient = (): OAuth2Client => {
  return new OAuth2Client(Config.GOOGLE_CLIENT_ID, Config.GOOGLE_CLIENT_SECRET, Config.GOOGLE_CALLBACK_URL)
}

const client = createOAuthClient()

/** Generate a token using authentication code */
const generateToken = async (code: string): Promise<Credentials> => {
  const { tokens } = await client.getToken(code)
  return tokens
}

/** Save a token into file system */
const saveToken = async (token: Credentials): Promise<void> => {
  const payload = JSON.stringify(token)
  return fs.writeFile(TOKEN_PATH, payload, 'utf-8')
}

/** Reads previously authorized credentials from the save file. */
const loadTokenIfExists = async (): Promise<Credentials> => {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8')
    return JSON.parse(content) as Credentials
  } catch (err) {
    throw new Error('Not stored credentials or invalid')
  }
}

/**
 * Validate client access token from client credentials. If the token is expired,
 * refresh it and save it.
 * Throws error if is not possible to refresh.
 */
const validateOrRefreshClientCredentials = async (): Promise<void> => {
  const savedAccessToken = client.credentials.access_token
  try {
    const { token } = await client.getAccessToken()
    if (token !== savedAccessToken) {
      await saveToken(client.credentials)
    }
  } catch (error) {
    console.log(error)
    throw new Error('No valid credentials or unable to refresh token')
  }
}

const setCredentials = async (credentials: Credentials) => {
  client.setCredentials(credentials)
}

const requestConsent = (scope: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope
    })
    const server = http
      .createServer(async (req, res) => {
        if (!req.url) {
          reject()
          return
        }
        const queryParams = new url.URL(req.url, 'http://localhost:3000').searchParams
        const code = queryParams.get('code')
        res.end('Authentication successful! Please return to the console.')
        // @ts-ignore destroyer() add this method
        server.destroy()
        if (!code) {
          reject('No code')
          return
        }
        resolve(code)
      })
      .listen(3000, () => {
        open(authorizeUrl, { wait: false, app: { name: 'chromium' } }).then((cp) => cp.unref())
      })

    destroyer(server)
  })
}

const authorize = async (scopes: string[]) => {
  try {
    const credentials = await loadTokenIfExists()
    await setCredentials(credentials)
    await validateOrRefreshClientCredentials()
  } catch (error) {
    console.error(error)
    const code = await requestConsent(scopes)
    const credentials = await generateToken(code)
    await setCredentials(credentials)
    await saveToken(credentials)
  }
  return client
}

export { client, authorize }
