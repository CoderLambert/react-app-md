const fg = require('fast-glob')
const fs = require('fs')
const path = require('path')
import { expect, test } from 'vitest'
import { FileSystem } from '../main/utils/file'
/**
 * 将文件路径列表转换为树形结构
 * @param {string[]} filePaths 文件路径列表
 * @returns {Object} 树形结构
 */
// function buildTree(filePaths) {
//   const tree = {}

//   filePaths.forEach((filePath) => {
//     const parts = filePath.split(path.sep)
//     let currentLevel = tree

//     parts.forEach((part, index) => {
//       if (!currentLevel[part]) {
//         currentLevel[part] = index === parts.length - 1 ? null : {}
//       }
//       currentLevel = currentLevel[part] || {}
//     })
//   })

//   return tree
// }

/**
 * 将树形结构转换为 Ant Design Tree 数据结构
 * @param {Object} tree 树形结构
 * @param {string} parentPath 父节点路径
 * @returns {Array} Ant Design Tree 数据
 */
function convertToAntTree(tree, parentPath = '') {
  return Object.keys(tree).map((key) => {
    const fullPath = parentPath ? `${parentPath}/${key}` : key
    const node = tree[key]

    const children = node && typeof node === 'object' ? convertToAntTree(node, fullPath) : undefined

    return {
      title: key,
      key: fullPath,
      children: children
    }
  })
}

/**
 * 生成文件目录的树形结构
 * @param {string} pattern 文件匹配模式
 * @returns {Promise<string>} 树形结构字符串
 */
async function generateDirectoryTree(pattern) {
  const filePaths = await fg(pattern, {
    onlyFiles: false,
    objectMode: true,
    cwd: 'D:\\电子书\\'
  })
  const tree = buildTree(filePaths.map((file) => file.path))
  return convertToAntTree(tree)
}

function buildTree(paths, baseDir = '') {
  const tree = {}

  paths.forEach((filePath) => {
    const relativePath = path.relative(baseDir, filePath)
    const parts = relativePath.split(path.sep)

    let currentLevel = tree

    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {}
      }

      if (index === parts.length - 1) {
        currentLevel[part] = filePath // 如果是文件，存储完整路径
      } else {
        currentLevel = currentLevel[part] // 进入下一层
      }
    })
  })

  return tree
}

test('generateDirectoryTree', async () => {
  // 示例：生成当前目录的树形结构
  const tree = await generateDirectoryTree('**/*.{md,png,gif,mp3,wav}')

  // console.log(JSON.stringify(tree, null, 2))
  // fs.writeFileSync('D:\\电子书\\tree.json', JSON.stringify(tree, null, 2))
  expect(tree).toBeDefined()
})

// test('FileSystem test', async () => {
//   const result = await FileSystem.getAllDirFiles('D:\\电子书\\', {
//     extensions: ['md', 'png', 'gif', 'mp3', 'wav'],
//     excludeHidden: true
//   })

//   console.log(JSON.stringify(result, null, 2))
// })
