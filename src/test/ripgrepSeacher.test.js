import RipgrepDirectorySearcher from "../main/utils/ripgrep/ripgrepSearcher";
import { test} from 'vitest'
import { rgPath  } from '@vscode/ripgrep'
import path from 'path'
test('查询 md ', async () => {
  // 示例：生成当前目录的树形结构
  const rgSearcher  = new RipgrepDirectorySearcher()
  const testDocDir = path.resolve(__dirname, 'docs/')
  const results = [];
  const res = await rgSearcher.searchInDirectory(testDocDir, '^(#{1})\\s+(.+)$', {
    didMatch: (result) => results.push(result),
    isRegexp: true,

  })

  console.log(JSON.stringify(results, null, 4))
})
