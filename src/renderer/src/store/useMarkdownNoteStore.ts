// import { IFileNode } from '@renderer/views/markdown'
import { TreeDataNode } from 'antd'
import { create } from 'zustand'
interface IMarkdownNoteState {
  rootDirPath: string
  setRootDirPath: (rootDirPath: string) => void

  dirTreeInfo: TreeDataNode[]
  setDirTreeInfo: (dirTreeInfo: TreeDataNode[]) => void

  noteFilePath: string
  setNoteFilePath: (noteFilePath: string) => void

  noteDirPath: string
  setNoteDirPath: (noteDirPath: string) => void

  fileText: string
  setFileText: (fileText: string) => void
}

const useMarkdownNoteStore = create<IMarkdownNoteState>((set) => ({
  // 树形文件目录
  rootDirPath: '',
  setRootDirPath: (rootDirPath: string): void => set(() => ({ rootDirPath })),

  // ant-tree 数据
  dirTreeInfo: [],
  setDirTreeInfo: (dirTreeInfo: TreeDataNode[]): void => set(() => ({ dirTreeInfo })),

  // 当前 markdown 文件路径
  noteFilePath: '',
  setNoteFilePath: (noteFilePath: string): void => set({ noteFilePath }),

  // 当前 markdown 文件目录路径
  noteDirPath: '',
  setNoteDirPath: (noteDirPath: string): void => set({ noteDirPath }),

  // 当前 markdown 文件内容
  fileText: '',
  setFileText: (fileText: string): void => set({ fileText })
}))

export { useMarkdownNoteStore }

export type { IMarkdownNoteState }
