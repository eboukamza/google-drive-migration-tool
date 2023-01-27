import { google } from 'googleapis'
import { buildDriveUtils } from './drive.utils'

const drive = google.drive({ version: 'v3' })

const driveUtils = buildDriveUtils(drive)

export { driveUtils }

