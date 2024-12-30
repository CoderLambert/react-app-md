import { expect, test } from 'vitest'

import { FileSystem } from '../main/utils/file'

import fg from 'fast-glob'

// import fs from 'fs'

// test('isDirectory', () => {
//   expect(FileSystem.isDirectorySync('src/main')).toBe(true)
//   expect(FileSystem.isDirectorySync('src/main/file.js')).toBe(false)
//   expect(FileSystem.isDirectorySync('src/main/file')).toBe(false)
//   expect(FileSystem.isDirectorySync('src/main/unknown')).toBe(false)
// })

// test('getAllDirFiles', () => {
//   const start = Date.now()

//   FileSystem.getAllDirFiles('D:\\电子书\\clean-arch', {
//     excludeHidden: true,
//     includeFileTypes: ['.ts', '.js']
//   })
//   // console.log(JSON.stringify(files, null, 2))
//   console.log(`getAllDirFiles 耗时: ${Date.now() - start}ms`)
// })

test('getAllDirFiles --> fg', () => {
  const start = Date.now()

  const files = fg.sync('**/*.{md,jpg,png,gif,mp3,wav}', {
    dot: false,
    onlyFiles: false,
    cwd: 'D:\\电子书\\vuepress-site',
    absolute: false,
    ignore: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.idea/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/target/**',
      '**/logs/**',
      '**/logs/**',
      '**/temp/**',
      '**/tmp'
    ]
  })
  console.log(JSON.stringify(files, null, 2))
  console.log(`getAllDirFiles --> fg 耗时: ${Date.now() - start}ms`)
})

// test('scan', async () => {
//   const start = Date.now()
//   await scan()

//   console.log(`scan 耗时: ${Date.now() - start}ms`)
// })
