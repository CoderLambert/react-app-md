import { visit } from 'unist-util-visit'
// import { resolvePath } from './utils.js'
import path from 'path-browserify-esm'
// 获取当前文件的目录路径

export const isOsx = window && window.navigator && /Mac/.test(window.navigator.platform)
export const isWin =
  window &&
  window.navigator.userAgent &&
  /win32|wow32|win64|wow64/i.test(window.navigator.userAgent)

export const correctImageSrc = (src, parentPath) => {
  if (src) {
    // Fix ASCII and UNC paths on Windows (#1997).
    if (isWin && /^(?:[a-zA-Z]:\\|[a-zA-Z]:\/).+/.test(src)) {
      src = 'file:///' + src.replace(/\\/g, '/')
    } else if (isWin && /^\\\\\?\\.+/.test(src)) {
      src = 'file:///' + src.substring(4).replace(/\\/g, '/')
    } else if (/^[^/\\][^:]*$/.test(src)) {
      // Also adding file protocol on UNIX.
      src = 'file://' + path.resolve(parentPath, src)
    }
  }
  return src
}

// 自定义插件函数
function rehypeImageAbsolutePath(options) {
  return (tree): void => {
    // 遍历 AST 树中的所有图片节点
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const src = node.properties.src
        console.log('src:', src)
        node.properties.src = correctImageSrc(node.properties.src, options.absolutePath)
        console.log('node.properties.src:', node.properties.src)
      }
    })
  }
}

export default rehypeImageAbsolutePath
