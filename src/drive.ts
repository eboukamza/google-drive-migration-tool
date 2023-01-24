import { drive_v3, google } from 'googleapis'

type FileList = drive_v3.Schema$FileList

const drive = google.drive({ version: 'v3' })

/**
 * List files owned by an email
 */
const listFiles = async (owner: string, pageToken?: string) => {
  const res = await drive.files.list({
    pageSize: 1000,
    fields: 'nextPageToken, files(id, name, parents, mimeType)',
    q: `'${owner}' in owners`,
    pageToken
  })

  const data: FileList = res.data
  const files = data.files
  if (!files || files?.length === 0) {
    console.log('No files found.')
    return
  }

  files.map((file) => {
    console.log(`${file.id} ${file.parents} (${file.name}, ${file.mimeType})`)
  })

  if (data.nextPageToken) {
    await listFiles(owner, data.nextPageToken)
  }
}

const copyFileWithName = async ({ fileId, name }: { fileId: string; name: string }) => {
  const res = await drive.files.copy({
    fileId,
    fields: '*',
    requestBody: { name }
  })

  if (res.status !== 200) {
    throw new Error('Copy fail')
  }
  console.log('Copied', name)
}

export { listFiles, copyFileWithName }
