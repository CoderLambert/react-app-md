import FileSearcher from "../main/utils/ripgrep/fileSeacher";
import {test} from 'vitest'
import {rgPath} from '@vscode/ripgrep'
import path from 'path'

test('FileSearcher:', async () => {
  // 示例：生成当前目录的树形结构
  const numPathsFound = {num: 0};
  const fileSearcher = new FileSearcher(rgPath)
  const testDocDir = path.resolve(__dirname, 'docs/')
  let results = [];
  const res = await fileSearcher.searchInDirectory(testDocDir,
    'ch13.md',
    {
      inclusions: ['*.md'], // 可选：限制文件类型
      didMatch: (filePath) => {
        results.push(filePath)
      }
    },
    numPathsFound
  )

  console.log(`${results.length} 文件中，共发现 ${numPathsFound.num} 结果`)
})
