const listMock = jest.fn(() => ({
  data: {
    files: []
  }
}))

export const google = {
  options: jest.fn(),
  drive: jest.fn(() => ({
    files: {
      list: listMock,
      copy: jest.fn(() => ({
        status: 200
      })),
      create: jest.fn(({ requestBody: { name, parents } }) => ({
        status: 200,
        data: { name, parents, id: `${name}-id` }
      }))
    }
  }))
}
