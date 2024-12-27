import { BrowserWindow, dialog, OpenDialogReturnValue, ipcMain, app } from 'electron'

// 定义一个类型来表示 Map 的值
type IOpenDialogAction = (
  currentWindow: BrowserWindow,
  ...args: unknown[]
) => Promise<string | null>
type IQuitAppDialogAction = (currentWindow: BrowserWindow, ...args: unknown[]) => Promise<boolean>
// 使用 Map 来存储对话框操作
export const dialogActions = new Map<string, IOpenDialogAction | IQuitAppDialogAction>([
  ['lz:open-file-dialog', openFileDialog],
  ['lz:open-dir-dialog', openDirectoryDialog],
  ['lz:quit-app-dialog', quitAppDialog]
])

/**
 * 打开文件夹对话框
 * @param currentWindow - 当前窗口实例
 * @returns 返回选中的文件夹路径，如果未选择则返回 null
 */
export async function openDirectoryDialog(
  currentWindow: BrowserWindow,
  ...args: unknown[]
): Promise<string | null> {
  console.log('openDirectoryDialog args:', args) // 打印渲染进程传递的参数
  const result: OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
    title: '选择文件夹',
    defaultPath: app.getPath('home'),
    properties: ['openDirectory']
  })

  // 检查用户是否取消操作，并返回选中的文件夹路径
  return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null
}

// 打开文件对话框，选择并返回文件路径
export async function openFileDialog(
  currentWindow: BrowserWindow,
  ...args: unknown[]
): Promise<string | null> {
  console.log('openFileDialog args:', args) // 打印渲染进程传递的参数

  const result: OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
    properties: ['openFile']
  })

  // 检查用户是否取消操作，并返回选中的文件路径
  return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null
}

// 退出应用对话框，返回一个 Promise，用于等待用户选择退出还是取消操作
export async function quitAppDialog(
  currentWindow: BrowserWindow,
  ...args: unknown[]
): Promise<boolean> {
  console.log('quitAppDialog args:', args) // 打印渲染进程传递的参数

  const result: OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
    title: '退出应用',
    message: '是否确定退出应用？',
    buttonLabel: '确定'
  })

  // 检查用户是否选择了确定，并返回结果
  return !result.canceled
}

// 根据 dialogActions Map 中的对象，ipcMain.handle 注册
export async function registerDialogActions(currentWindow: BrowserWindow): Promise<void> {
  for (const [channel, action] of dialogActions) {
    console.log('registerDialogActions', channel, action)
    ipcMain.handle(channel, async (_event, ...args) => {
      // console.log('registerDialogActions', channel, event, args)
      return await action(currentWindow, ...args)
    })
  }
}
