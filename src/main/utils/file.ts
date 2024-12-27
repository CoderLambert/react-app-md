import fse from 'fs-extra'
import fsPromises from 'fs/promises'

import * as path from 'path'
import * as fs from 'fs'
import { IFileNode } from '@common/types/md'
export interface IGetAllDirOptions {
  excludeHidden?: boolean // 是否排除隐藏文件夹和文件
  excludeFileTypes?: string[] // 需要排除的文件类型（扩展名）
  includeFileTypes?: string[] // 需要包含的文件类型（扩展名）
  excludeDirectories?: string[] // 需要排除的目录名
  level: number | null
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
    const { excludeHidden, excludeFileTypes, includeFileTypes, excludeDirectories } = options
    const filesNameArr: IFileNode[] = []
    const mapDeep: { [key: string]: number } = { [dir]: 0 }
    console.log('options:', options)
    // 判断是否为隐藏文件或文件夹
    const isHidden = (file: string): boolean => file.startsWith('.')

    // 判断是否需要排除文件类型
    const shouldExcludeFileType = (file: string): boolean =>
      excludeFileTypes ? excludeFileTypes.includes(path.extname(file)) : false

    // 判断是否需要包含文件类型
    const shouldIncludeFileType = (file: string): boolean =>
      includeFileTypes
        ? includeFileTypes.length === 0 || !includeFileTypes.includes(path.extname(file))
        : true

    // 判断是否需要排除目录
    const shouldExcludeDirectory = (file: string): boolean =>
      excludeDirectories ? excludeDirectories.includes(file) : false

    // 递归读取目录结构
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
        // console.log('file:', file)

        if (excludeHidden && isHidden(file)) return // 排除隐藏文件或文件夹
        if (shouldExcludeDirectory(file)) return // 排除指定目录

        const subPath = path.join(currentDir, file)
        const stats = fs.statSync(subPath)

        if (stats.isDirectory()) {
          result.children?.push(readDirs(subPath, file))
        } else {
          if (shouldExcludeFileType(file)) return // 排除指定文件类型
          if (!shouldIncludeFileType(file)) return // 不包含指定文件类型
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
}
