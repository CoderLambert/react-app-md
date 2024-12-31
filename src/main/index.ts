import { app, shell, BrowserWindow, dialog, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerDialogActions } from './ipcMain/dialogActions'
import { registerDirActions } from './ipcMain/dirActions'
import { registerFileActions } from './ipcMain/fileActions'

import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

class MainWindow {
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.initializeApp()
  }

  private createWindow(): BrowserWindow {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      width: 1500,
      height: 970,
      show: false,
      fullscreen: false, // 默认全屏
      autoHideMenuBar: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        webSecurity: app.isPackaged
      }
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // 监听窗口的 close 事件
    this.mainWindow.on('close', (event) => {
      // 阻止默认的关闭行为
      event.preventDefault()

      // 弹出确认对话框
      dialog
        .showMessageBox(this.mainWindow as BrowserWindow, {
          type: 'warning',
          title: '是否退出应用程序？',
          message: '你确定要关闭窗口吗？',
          buttons: ['关闭', '取消'],
          detail: '此操作将关闭整个应用程序。',
          defaultId: 1 // 默认选中“取消”按钮
        })
        .then(({ response }) => {
          if (response === 0) {
            // 如果用户点击“关闭”按钮，允许窗口关闭
            ;(this.mainWindow as BrowserWindow).destroy() // 销毁窗口
          }
        })
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // 监听路由请求
    // this.mainWindow.webContents.on('will-navigate', (event, url) => {
    //   if (!url.startsWith('file://')) {
    //     event.preventDefault()
    //     this.mainWindow!.loadFile(join(__dirname, '../renderer/index.html'))
    //   }
    // })

    return this.mainWindow
  }

  private initializeApp(): void {
    app.whenReady().then(() => {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((ext) => console.log(`Added Extension:  ${ext.name}`))
        .catch((err) => console.log('An error occurred: ', err))

      // Set app user model id for windows
      electronApp.setAppUserModelId('com.electron')
      this.createWindow()
      this.initActions()

      // 注册全局快捷键 F12
      // globalShortcut.register('F12', () => {
      //   if (this.mainWindow) {
      //     this.mainWindow.webContents.toggleDevTools()
      //   }
      // })

      globalShortcut.register('Alt+1', () => {
        if (this.mainWindow!.webContents.isDevToolsOpened()) {
          this.mainWindow!.webContents.closeDevTools()
        } else {
          this.mainWindow!.webContents.openDevTools()
        }
      })

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
        // 全屏
      })

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        console.log(BrowserWindow.getAllWindows().length)
        if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      })
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private initActions(): void {
    registerDialogActions(this.mainWindow as BrowserWindow)
    registerDirActions(this.mainWindow as BrowserWindow)
    registerFileActions(this.mainWindow as BrowserWindow)
  }
}

// Instantiate the MainWindow class to initialize the app
new MainWindow()
