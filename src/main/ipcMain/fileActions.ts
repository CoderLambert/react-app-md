import { BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'

// 定义一个类型来表示 Map 的值
type IFileAction = (currentWindow: BrowserWindow, ...args: unknown[]) => Promise<string | null>

// 使用 Map 来存储文件操作
export const fileActions = new Map<string, IFileAction>([
  [
    'lz:read-file-content',
    async (currentWindow: BrowserWindow, ...args: unknown[]): Promise<string | null> => {
      if (args.length !== 1 || typeof args[0] !== 'string') {
        console.error('Invalid arguments for readFileContent')
        return null
      }
      const filePath = args[0] as string
      return readFileContent(currentWindow, filePath)
    }
  ]
])

/**
 * 读取文件内容
 * @param _currentWindow - 当前窗口实例
 * @param filePath - 文件路径
 * @returns 返回文件内容，如果读取失败则返回 null
 */
export async function readFileContent(
  _currentWindow: BrowserWindow,
  filePath: string
): Promise<string | null> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

// 根据 fileActions Map 中的对象，ipcMain.handle 注册
export async function registerFileActions(currentWindow: BrowserWindow): Promise<void> {
  for (const [channel, action] of fileActions) {
    ipcMain.handle(channel, async (_event, ...args) => {
      return await action(currentWindow, ...args)
    })
  }
}
