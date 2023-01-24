import { drive_v3, google } from 'googleapis'

type FileList = drive_v3.Schema$FileList

const drive = google.drive({ version: 'v3' })

type MyFile = {
  id: string,
  parent: string,
  name: string,
  mimeType: string
}

const listFilesByQuery = async (query: string, pageToken?: string): Promise<MyFile[]> => {
  const res = await drive.files.list({
    pageSize: 1000,
    fields: 'nextPageToken, files(id, name, parents, mimeType)',
    q: query,
    pageToken
  })

  const data: FileList = res.data
  const files = data.files
  if (!files || files?.length === 0) {
    console.log('No files found.')
    return []
  }

  const fileList: MyFile[] = files.map((file) => {
    return {
      id: file.id ?? '',
      parent: file.parents && file.parents.length > 0 ? file.parents[0] : '',
      name: file.name ?? '',
      mimeType: file.mimeType ?? ''
    }
  })

  if (data.nextPageToken) {
    const nextFiles = await listFilesByQuery(query, data.nextPageToken)
    fileList.concat(nextFiles)
  }

  return fileList
}

/**
 * List files owned by an email
 */
const listAllOwnedFiles = async (owner: string) => {
  const query = `'${owner}' in owners`
  const fileList = await listFilesByQuery(query)
  fileList
    .map(({ id, parent, name, mimeType }) =>
      console.log(`${id} ${parent} (${name}, ${mimeType})`)
    )
}

const listOwnedFolders = async (owner: string) => {
  const query = `'${owner}' in owners and mimeType = 'application/vnd.google-apps.folder'`
  const fileList = await listFilesByQuery(query)
  fileList
    .map(({ id, parent, name, mimeType }) =>
      console.log(`${id} ${parent} (${name}, ${mimeType})`)
    )
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

export { listAllOwnedFiles, listOwnedFolders, copyFileWithName }
