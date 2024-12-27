import { BrowserWindow, ipcMain } from 'electron'
import { FileSystem, IGetAllDirOptions } from '../utils/file'
import { IFileNode } from '@common/types/md'

// 定义一个类型来表示 Map 的值
type IReadDirAction = (currentWindow: BrowserWindow, ...args: unknown[]) => IFileNode[]
// type IQuitAppDialogAction = (currentWindow: BrowserWindow) => Promise<boolean>
// 使用 Map 来存储对话框操作
export const dirActions = new Map<string, IReadDirAction>([
  ['lz:read-dir-with-ant-tree', readDirectoryWithAntTree]
])

/**
 * 打开文件夹对话框
 * @param _currentWindow - 当前窗口实例
 * @returns 返回选中的文件夹路径，如果未选择则返回 null
 */
export function readDirectoryWithAntTree(
  _currentWindow: BrowserWindow,
  ...args: unknown[]
): IFileNode[] {
  const [filePath, ...rest] = args
  const res = FileSystem.getAllDirFiles(filePath as string, rest[0] as IGetAllDirOptions)
  return res
}

// 根据 dialogActions Map 中的对象，ipcMain.handle 注册
export async function registerDirActions(currentWindow: BrowserWindow): Promise<void> {
  for (const [channel, action] of dirActions) {
    ipcMain.handle(channel, async (_event, ...args) => {
      return await action(currentWindow, ...args)
    })
  }
}
