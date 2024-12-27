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
      console.log('相对路径:', src)
      // Also adding file protocol on UNIX.
      src = 'file://' + path.resolve(parentPath, src)
      console.log('相对路径纠正:', src)
    }
  }
  return src
}

// 自定义插件函数
function rehypeImageAbsolutePath(options) {
  return (tree) => {
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

// function pathResolve(basedir, ...paths) {
//   // Determine if basedir is absolute
//   let baseIsAbsolute = isWindowsAbsolutePath(basedir) || basedir.startsWith('/')

//   // Normalize and split base directory
//   let baseDrive = getDriveLetter(basedir)
//   let baseUNC = isWindowsUNCPath(basedir)
//   let basePath = baseDrive
//     ? basedir.substr(baseDrive.length)
//     : baseUNC
//       ? basedir.substr(2)
//       : baseIsAbsolute
//         ? basedir
//         : ''
//   basePath = basePath
//     .replace(/\\/g, '/')
//     .split('/')
//     .filter((part) => part !== '')

//   // Normalize and process paths
//   let normalizedPaths = paths.map((path) => path.replace(/\\/g, '/'))
//   console.log('normalizedPaths:', normalizedPaths)
//   // Process paths from right to left
//   for (let i = normalizedPaths.length - 1; i >= 0; i--) {
//     let path = normalizedPaths[i]
//     let pathDrive = getDriveLetter(path)
//     let pathUNC = isWindowsUNCPath(path)
//     let pathParts = pathDrive
//       ? path.substr(pathDrive.length).split('/')
//       : pathUNC
//         ? path.substr(2).split('/')
//         : path.split('/')

//     // If path is absolute, use it as new base
//     if (pathDrive || pathUNC || (baseIsAbsolute && path.startsWith('/'))) {
//       baseDrive = pathDrive
//       baseUNC = pathUNC
//       basePath = pathParts.filter((part) => part !== '')
//       break
//     } else {
//       // Prepend path parts to base path
//       basePath = pathParts.concat(basePath)
//     }
//   }

//   // Resolve relative parts
//   let resolvedParts = []
//   basePath.forEach((part) => {
//     if (part === '.') {
//       // Ignore
//     } else if (part === '..') {
//       if (resolvedParts.length > 0) {
//         resolvedParts.pop()
//       }
//     } else {
//       resolvedParts.push(part)
//     }
//   })

//   // Reconstruct the final path
//   let resolvedPath = ''
//   if (baseDrive) {
//     resolvedPath = baseDrive + resolvedParts.join('/')
//   } else if (baseUNC) {
//     resolvedPath = '\\' + '\\' + resolvedParts.join('/')
//   } else if (baseIsAbsolute) {
//     resolvedPath = '/' + resolvedParts.join('/')
//   } else {
//     resolvedPath = resolvedParts.join('/')
//   }
//   console.log('resolvedPath:', resolvedPath)
//   return resolvedPath
// }

// Helper functions
// function isWindowsAbsolutePath(path) {
//   return isWindowsUNCPath(path) || (path.length >= 2 && path[1] === ':')
// }

// function isWindowsUNCPath(path) {
//   return path.startsWith('\\\\')
// }

// function getDriveLetter(path) {
//   if (path.length >= 2 && path[1] === ':' && !isWindowsUNCPath(path)) {
//     return path[0].toUpperCase() + ':'
//   }
//   return ''
// }

export default rehypeImageAbsolutePath
