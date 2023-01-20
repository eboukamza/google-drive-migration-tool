import { drive_v3 } from 'googleapis'
import { authorize } from "./auth";

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

const main = async () => {
  const authClient = await authorize()
  if (!authClient) {
    console.error('You need to auth first')
    process.exit(1)
  }

  google.options({ auth: authClient });

  return listFiles()
}

main().catch(console.error)
