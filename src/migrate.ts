import { google } from 'googleapis'

import { authorize, getEmail } from './auth/auth-client'
import { driveUtils } from './drive'

/**
 * Migrate files preserving hierarchy from source to destination
 * @param sourceDir name of the source folder
 * @param destDir name of the destination folder
 */
const migrate = async (sourceDir: string, destDir: string) => {
  console.log(`Migrating '${sourceDir}' -> '${destDir}'`)

  const SCOPES = ['email', 'https://www.googleapis.com/auth/drive']
  const client = await authorize(SCOPES)
  google.options({ auth: client })

  const email = await getEmail()
  console.log(`Connected as ${email}`)

  const sourceFolder = await driveUtils.searchMigrationSource(sourceDir)
  const destFolder = await driveUtils.createFolder(destDir, sourceFolder.parents ? sourceFolder.parents[0] : undefined)

  await driveUtils.copyRecursive(sourceFolder, destFolder)
  console.log('Done!')
}

export { migrate }
