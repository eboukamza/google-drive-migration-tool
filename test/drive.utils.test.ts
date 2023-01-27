import { drive_v3, google } from 'googleapis'
import { buildDriveUtils } from '../src/drive/drive.utils'

const drive = google.drive({ version: 'v3' })

const driveUtils = buildDriveUtils(drive)

describe('drive utils', () => {
  test('list owned folders', async () => {
    const mockListFn = drive.files.list as jest.Mock

    const files: drive_v3.Schema$File[] = [
      { parents: ['folder-b'], name: 'subFolderB2', id: 'sub-folder-b2' },
      { parents: ['root'], name: 'folderA', id: 'folder-a' },
      { parents: ['folder-a'], name: 'subFolderA1', id: 'sub-folder-a1' },
      { parents: ['folder-b'], name: 'subFolderB1', id: 'sub-folder-b1' },
      { parents: ['root'], name: 'folderB', id: 'folder-b' },
      { parents: ['folder-a'], name: 'subFolderA2', id: 'sub-folder-a2' },
      { parents: ['sub-folder-a1'], name: 'subFolderA1x', id: 'sub-folder-a1x' }
    ]

    mockListFn.mockImplementation(() => ({
      data: {
        files: files
      }
    }))

    const res = await driveUtils.listOwnedFolders('me@test')

    expect(res[0]).toEqual({ parents: ['folder-b'], name: 'subFolderB2', id: 'sub-folder-b2' })
  })
})
