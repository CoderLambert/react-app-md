import fse from 'fs-extra'
import fsPromises from 'fs/promises'

import * as path from 'path'
import * as fs from 'fs'
import { IFileNode } from '@common/types/md'

export interface IGetAllDirOptions {
  excludeHidden?: boolean // 是否排除隐藏文件夹和文件
  // excludeFileTypes?: string[] // 需要排除的文件类型（扩展名）
  includeFileTypes?: string[] // 需要包含的文件类型（扩展名）
  // excludeDirectories?: string[] // 需要排除的目录名
  // level: number | null
}

export class FileSystem {
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return await fsPromises.readFile(filePath, { encoding })
  }

  static readFileSync(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
    return fse.readFileSync(filePath, { encoding })
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    return await fsPromises.writeFile(filePath, content)
  }

  static writeFileSync(filePath: string, content: string): void {
    return fse.writeFileSync(filePath, content)
  }

  static isFile(filepath): boolean {
    try {
      return fse.existsSync(filepath) && fse.lstatSync(filepath).isFile()
    } catch (_) {
      return false
    }
  }

  static async readDir(
    dirPath: string,
    options?:
      | {
          encoding: BufferEncoding | null
          withFileTypes?: false | undefined
          recursive?: boolean | undefined
        }
      | BufferEncoding
      | null
  ): Promise<string[]> {
    return await fsPromises.readdir(dirPath, options)
  }

  static async readDirSync(
    dirPath: string,
    options?:
      | {
          encoding: BufferEncoding | null
          withFileTypes?: false | undefined
          recursive?: boolean | undefined
        }
      | BufferEncoding
      | null
  ): Promise<string[] | null> {
    if ((await this.exists(dirPath)) && this.ensureDirSync(dirPath)) {
      return fse.readdirSync(dirPath, options)
    } else {
      return null
    }
  }

  static isDirectorySync(dirPath): boolean {
    try {
      return fse.existsSync(dirPath) && fse.lstatSync(dirPath).isDirectory()
    } catch (_) {
      return false
    }
  }

  static ensureDirSync(dirPath): boolean {
    try {
      fse.ensureDirSync(dirPath)
      return true
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
        return false
      }
      throw e
    }
  }

  static isSymbolicLink(filepath): boolean {
    try {
      return fse.existsSync(filepath) && fse.lstatSync(filepath).isSymbolicLink()
    } catch (_) {
      return false
    }
  }

  // 判断路径是否存在

  static async exists(p): Promise<boolean> {
    try {
      await fsPromises.access(p)
      return true
    } catch (_) {
      return false
    }
  }

  // 以树形结构获取所有文件

  static getAllDirFiles(dir: string, options: IGetAllDirOptions): IFileNode[] {
    // const { excludeHidden, excludeFileTypes, includeFileTypes, excludeDirectories } = options
    const { excludeHidden, includeFileTypes } = options

    const filesNameArr: IFileNode[] = []
    const mapDeep: { [key: string]: number } = { [dir]: 0 }
    // 判断是否为隐藏文件或文件夹
    const isHidden = (file: string): boolean => file.startsWith('.')

    // 判断是否需要包含文件类型
    const shouldIncludeFileType = (file: string): boolean => {
      const ext = path.extname(file)

      return includeFileTypes?.includes(ext) || false
    }

    // // 使用 fast-glob 递归获取所有文件和目录
    // const files = fg.sync([`${dir}/**/*.md`], {
    //   dot: !excludeHidden, // 是否包含隐藏文件
    //   onlyFiles: false, // 包含文件和目录
    //   absolute: true, // 返回绝对路径
    //   stats: true // 获取文件状态信息
    // })

    const readDirs = (currentDir: string, folderName: string): IFileNode => {
      const result: IFileNode = {
        path: currentDir,
        name: path.basename(currentDir),
        title: path.basename(currentDir),
        type: 'directory',
        deep: mapDeep[folderName],
        children: []
      }

      const files = fs.readdirSync(currentDir)

      files.forEach((file) => {
        if (excludeHidden && isHidden(file)) return // 排除隐藏文件或文件夹

        const subPath = path.join(currentDir, file)
        const stats = fs.statSync(subPath)

        if (stats.isDirectory()) {
          const subDir = readDirs(subPath, folderName)
          if (subDir?.children && subDir.children.length > 0) {
            result.children!.push(subDir)
          }
        } else if (shouldIncludeFileType(file)) {
          result.children?.push({
            path: subPath,
            name: file,
            title: file,
            type: 'file',
            ext: path.extname(file)
          })
        }
      })

      return result
    }

    // 读取目录结构
    filesNameArr.push(readDirs(dir, dir))

    return filesNameArr
  }

  static isDirectory(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()
    } catch (_) {
      return false
    }
  }

  /**
   * Normalize the path into an absolute path and resolves the link target if needed.
   *
   * @param {string} pathname The path or link path.
   * @returns {string} Returns the absolute path and resolved link. If the link target
   *                   cannot be resolved, an empty string is returned.
   */
  static normalizeAndResolvePath(pathname: string): string {
    if (this.isSymbolicLink(pathname)) {
      const absPath = path.dirname(pathname)
      const targetPath = path.resolve(absPath, fs.readlinkSync(pathname))
      if (this.isFile(targetPath) || this.isDirectory(targetPath)) {
        return path.resolve(targetPath)
      }
      console.error(`Cannot resolve link target "${pathname}" (${targetPath}).`)
      return ''
    }
    return path.resolve(pathname)
  }
}
