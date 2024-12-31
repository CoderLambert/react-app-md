const fg = require('fast-glob')
const path = require('path')
import { expect, test } from 'vitest'

/**
 * 将文件路径列表转换为树形结构
 * @param {string[]} filePaths 文件路径列表
 * @returns {Object} 树形结构
 */
function buildTree(filePaths) {
  const tree = {}

  filePaths.forEach((filePath) => {
    const parts = filePath.split(path.sep)
    let currentLevel = tree

    parts.forEach((part) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {}
      }
      currentLevel = currentLevel[part]
    })
  })

  return tree
}

/**
 * 将树形结构格式化为字符串
 * @param {Object} tree 树形结构
 * @param {string} indent 缩进字符
 * @returns {string} 格式化后的树形结构字符串
 */
function formatTree(tree, indent = '') {
  let result = ''
  const keys = Object.keys(tree)
  console.log(tree)
  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1
    result += `${indent}${isLast ? '└── ' : '├── '}${key}\n`

    if (Object.keys(tree[key]).length > 0) {
      result += formatTree(tree[key], `${indent}${isLast ? '    ' : '│   '}`)
    }
  })

  return result
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
    cwd: 'D:\\电子书\\clean-arch\\docs'
  })
  const tree = buildTree(filePaths.map((file) => file.path))
  return formatTree(tree)
}

test('generateDirectoryTree', async () => {
  // 示例：生成当前目录的树形结构
  const tree = await generateDirectoryTree('**/*.{md,png,gif,mp3,wav}')

  console.log(tree)
  expect(tree).toBeDefined()
})
