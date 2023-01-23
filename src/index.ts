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

const { google } = require('googleapis')

type FileList = drive_v3.Schema$FileList

/**
 * Lists the names and IDs of up to 10 files.
 */
const listFiles = async () => {
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

  return listFiles()
}

main().catch(console.error)
