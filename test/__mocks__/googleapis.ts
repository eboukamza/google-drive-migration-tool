const listMock = jest.fn(() => ({
  data: {
    files: []
  }
}))

export const google = {
  options: jest.fn(),
  drive: jest.fn(() => ({
    files: {
      list: listMock
    }
  }))
}
