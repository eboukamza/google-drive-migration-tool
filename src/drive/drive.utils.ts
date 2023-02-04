import { drive_v3 } from 'googleapis'

const buildDriveUtils = (drive: drive_v3.Drive) => {
  const listFilesByQuery = async (query: string, pageToken?: string): Promise<drive_v3.Schema$File[]> => {
    const res = await drive.files.list({
      pageSize: 1000,
      fields: 'nextPageToken, files(id, name, parents, mimeType, shortcutDetails(*))',
      q: query,
      pageToken
    })

    const data = res.data
    const files = data.files
    if (!files || files?.length === 0) {
      console.log('No files found.')
      return []
    }

    const fileList = files

    if (data.nextPageToken) {
      const nextFiles = await listFilesByQuery(query, data.nextPageToken)
      fileList.concat(nextFiles)
    }

    return fileList
  }

  /**
   * List files owned by an email
   */
  const listAllOwnedFiles = (owner: string): Promise<drive_v3.Schema$File[]> => {
    const query = `'${owner}' in owners`
    return listFilesByQuery(query)
  }

  const listOwnedFolders = (owner: string): Promise<drive_v3.Schema$File[]> => {
    const query = `'${owner}' in owners and mimeType = 'application/vnd.google-apps.folder'`
    return listFilesByQuery(query)
  }

  /**
   * List all files in a folder
   * @param fileId of the folder
   */
  const listFilesInFolder = (fileId: string): Promise<drive_v3.Schema$File[]> => {
    const query = `'${fileId}' in parents`
    return listFilesByQuery(query)
  }

  const searchMigrationSource = async (migrationSource: string): Promise<drive_v3.Schema$File> => {
    const query = `name = '${migrationSource}'`
    const files = await listFilesByQuery(query)
    if (files.length === 0) {
      throw new Error(`Unable to locate source folder: ${migrationSource}`)
    }
    if (files.length > 1) {
      throw new Error(`Ambiguous source folder ${migrationSource}`)
    }

    const [file] = files
    console.log(`Migration source found ${file.name} (${file.id})`)
    return file
  }

  const copyFileWithName = async (fileId: string, name: string, parentId?: string): Promise<void> => {
    const res = await drive.files.copy({
      fileId,
      fields: 'id, name, parents, mimeType',
      requestBody: {
        name,
        parents: parentId ? [parentId] : undefined
      }
    })

    if (res.status !== 200) {
      throw new Error('Copy fail')
    }
    console.log(`"${name}" OK`)
  }

  const createFolder = async (name: string, parentId?: string): Promise<drive_v3.Schema$File> => {
    const res = await drive.files.create({
      fields: 'name, parents, id',
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      }
    })

    if (res.status !== 200) {
      throw new Error('Create fail')
    }
    console.log('Created folder: ', res.data)
    return res.data
  }

  const copyRecursive = async (sourceDir: drive_v3.Schema$File, destDir: drive_v3.Schema$File): Promise<void> => {
    // list files in source dir
    console.log(`List files in folder "${sourceDir.name}" (${sourceDir.id})`)
    const files = await listFilesInFolder(sourceDir.id as string)

    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        console.log(`Create dest dir "${file.name}" (${file.id})`)
        const fileDest = await createFolder(file.name as string, destDir.id as string)
        await copyRecursive(file, fileDest)
      } else if (file.mimeType === 'application/vnd.google-apps.shortcut') {
        if (file.shortcutDetails?.targetMimeType === 'application/vnd.google-apps.folder') {
          console.log(`Create dest dir from shortcut "${file.name}" (${file.id} -> ${file.shortcutDetails.targetId}) `)
          const fileDest = await createFolder(file.name as string, destDir.id as string)
          const targetId = file.shortcutDetails.targetId
          await copyRecursive({ id: targetId, name: file.name }, fileDest)
        } else {
          console.log(`Copy shortcut file "${file.name}" (${file.id} -> ${file.shortcutDetails?.targetId})`, file.name)
          await copyFileWithName(file.shortcutDetails?.targetId as string, file.name as string, destDir.id as string)
        }
      } else {
        console.log(`Copy file "${file.name}" (${file.id})`)
        await copyFileWithName(file.id as string, file.name as string, destDir.id as string)
      }
    }
  }

  return {
    copyRecursive,
    createFolder,
    listFilesInFolder,
    copyFileWithName,
    searchMigrationSource,
    listOwnedFolders,
    listAllOwnedFiles
  }
}

export { buildDriveUtils }
