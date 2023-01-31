import { drive_v3, google } from 'googleapis'
import { buildDriveUtils } from '../src/drive/drive.utils'

const drive = google.drive({ version: 'v3' })

const driveUtils = buildDriveUtils(drive)
const MIME_TYPE_FOLDER = 'application/vnd.google-apps.folder'
const MIME_TYPE_FILE = 'application/vdn.google-apps.document'

describe('driveUtils', () => {
  test('list owned folders', async () => {
    const res = await driveUtils.listOwnedFolders('me@test')

    expect(res[0]).toEqual({
      parents: ['folder-b'],
      name: 'subFolderB2',
      id: 'sub-folder-b2',
      mimeType: 'application/vnd.google-apps.folder'
    })
  })

  test('copy recursive', async () => {
    const mockCreateFn = drive.files.create as jest.Mock
    const mockCopyFn = drive.files.copy as jest.Mock

    const sourceDir = { name: 'root', id: 'root' }
    const destDir = { name: 'destDir', id: 'dest-dir' }
    await driveUtils.copyRecursive(sourceDir, destDir)

    const fields = 'name, parents, id'
    expect(mockCreateFn.mock.calls).toEqual([
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'folderA', parents: ['dest-dir'] } }],
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'subFolderA1', parents: ['folderA-id'] } }],
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'subFolderA2', parents: ['folderA-id'] } }],
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'folderB', parents: ['dest-dir'] } }],
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'subFolderB2', parents: ['folderB-id'] } }],
      [{ fields, requestBody: { mimeType: MIME_TYPE_FOLDER, name: 'subFolderB1', parents: ['folderB-id'] } }]
    ])

    expect(mockCopyFn.mock.calls).toEqual([
      [{fields: 'id, name, parents, mimeType', fileId: 'file-a2x', requestBody: {name: 'fileA2x', parents: ['folderA-id']}}]
    ])
  })

  beforeEach(() => {
    // create stub
    const mockListFn = drive.files.list as jest.Mock
    const files: drive_v3.Schema$File[] = [
      { parents: ['folder-b'], name: 'subFolderB2', id: 'sub-folder-b2', mimeType: MIME_TYPE_FOLDER },
      { parents: ['root'], name: 'folderA', id: 'folder-a', mimeType: MIME_TYPE_FOLDER },
      { parents: ['folder-a'], name: 'subFolderA1', id: 'sub-folder-a1', mimeType: MIME_TYPE_FOLDER },
      { parents: ['folder-b'], name: 'subFolderB1', id: 'sub-folder-b1', mimeType: MIME_TYPE_FOLDER },
      {
        parents: ['root'],
        name: 'folderB',
        id: 'folder-b-shortcut',
        mimeType: 'application/vnd.google-apps.shortcut',
        shortcutDetails: { targetMimeType: MIME_TYPE_FOLDER, targetId: 'folder-b' }
      },
      { parents: ['folder-a'], name: 'fileA2x', id: 'file-a2x', mimeType: MIME_TYPE_FILE },
      { parents: ['folder-a'], name: 'subFolderA2', id: 'sub-folder-a2', mimeType: MIME_TYPE_FOLDER },
      { parents: ['sub-folder-a1'], name: 'subFolderA1x', id: 'sub-folder-a1x', mimeType: MIME_TYPE_FOLDER }
    ]

    mockListFn.mockImplementation(({ q }: drive_v3.Params$Resource$Files$List) => {
      let result: drive_v3.Schema$File[] = []
      if (q?.includes('in parents')) {
        const found = q.match(/'(?<parentId>[a-z\-]*)'/)
        const parentId = found?.groups ? found.groups.parentId : ''
        result = files.filter((file) => file.parents && file.parents.includes(parentId))
      } else if (q?.includes('in owners')) {
        result = files
      }

      return {
        data: {
          files: result
        }
      }
    })
  })
})
