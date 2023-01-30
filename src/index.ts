import { authorize } from './auth/auth-client'
import { driveUtils } from './drive'
import { Config } from './config'

const { google } = require('googleapis')

const SCOPES = ['email', 'https://www.googleapis.com/auth/drive']

const doMigration = async () => {

  const client = await authorize(SCOPES)
  google.options({ auth: client })

  const migrationSource = await driveUtils.searchMigrationSource(Config.MIGRATION_SOURCE)
  const destDir = await driveUtils.createFolder(
    Config.MIGRATION_DEST,
    migrationSource.parents ? migrationSource.parents[0] : undefined
  )

  await driveUtils.copyRecursive(migrationSource, destDir)
  console.log('Done!')
}

const listOwnedFiles = async () => {
  const client = await authorize(SCOPES)
  google.options({ auth: client })

  const email = Config.EMAIL_SRC
  const files = await driveUtils.listAllOwnedFiles(email)

  files.map(file => {
    console.log(`${file.name} (${file.id})`)
  })
}

//doMigration().catch(console.error)

listOwnedFiles().catch(console.error)
