function normalizePath(path) {
  return path.replace(/\\/g, '/')
}

function isAbsolutePath(path) {
  path = normalizePath(path)
  return path.startsWith('//') || path.startsWith('/') || (path.length >= 2 && path[1] === ':')
}

function resolvePath(basePath, relativePath) {
  // Normalize path separators
  basePath = normalizePath(basePath)
  relativePath = normalizePath(relativePath)
  console.log('relativePath:', relativePath)
  console.log('basePath ==>', basePath)
  // Check if relativePath is absolute
  if (isAbsolutePath(relativePath)) {
    // If relativePath has a drive letter or is UNC, return it as is
    if (relativePath.includes(':') || relativePath.startsWith('//')) {
      return relativePath
    } else {
      // If base has a drive letter, prepend it
      let baseDrive = null
      if (basePath.length >= 2 && basePath[1] === ':') {
        baseDrive = basePath.substr(0, 2)
      }
      if (baseDrive) {
        return baseDrive + '/' + relativePath.replace(/^\/+/, '')
      } else {
        return '/' + relativePath.replace(/^\/+/, '')
      }
    }
  }

  // Check if basePath has a drive letter or is UNC
  let baseDrive = null
  let baseUNC = false
  if (basePath.startsWith('//')) {
    baseUNC = true
  } else if (basePath.length >= 2 && basePath[1] === ':') {
    baseDrive = basePath.substr(0, 2) // e.g., 'C:'
  }

  // Split base path into parts, excluding drive or UNC
  let baseParts = []
  if (baseUNC) {
    baseParts = basePath
      .split('/')
      .slice(2)
      .filter((part) => part !== '')
  } else if (baseDrive) {
    baseParts = basePath
      .split('/')
      .slice(2)
      .filter((part) => part !== '')
  } else {
    baseParts = basePath.split('/').filter((part) => part !== '')
  }

  // Split relative path into parts
  let relativeParts = relativePath.split('/').filter((part) => part !== '')

  // Combine the parts
  let combinedParts = baseParts.concat(relativeParts)

  // Resolve '..' and '.'
  let resolvedParts = []
  for (let part of combinedParts) {
    if (part === '.') {
      // Current directory, ignore
    } else if (part === '..') {
      // Parent directory, remove last part
      if (resolvedParts.length > 0) {
        resolvedParts.pop()
      }
    } else {
      resolvedParts.push(part)
    }
  }

  // Reconstruct the path
  let resolvedPath = ''
  if (baseUNC) {
    resolvedPath = '//'
  } else if (baseDrive) {
    resolvedPath = baseDrive + '/'
  }

  resolvedPath += resolvedParts.join('/')

  return resolvedPath
}

export { resolvePath }
