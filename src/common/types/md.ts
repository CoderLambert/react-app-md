export interface IFileNode {
  path: string
  name?: string
  title?: string
  type: 'directory' | 'file'
  deep?: number
  ext?: string
  children?: IFileNode[]
}
