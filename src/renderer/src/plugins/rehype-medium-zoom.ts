/* eslint-disable @typescript-eslint/no-unused-vars */
import { visit } from 'unist-util-visit'

/**
 * 自定义 rehype 插件，为图片添加 medium-zoom 功能
 */
function rehypeMediumZoom() {
  return (tree): void => {
    // 遍历 hast 树，找到所有 <img> 标签
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        // 为图片添加 data-zoomable 属性
        node.properties = node.properties || {}
        node.properties['data-zoomable'] = true
      }
    })

    // 在 HTML 末尾注入 medium-zoom 的初始化脚本
    tree.children.push({
      type: 'element',
      tagName: 'script',
      properties: {
        type: 'text/javascript'
      },
      children: [
        {
          type: 'text',
          value: `
            document.addEventListener('DOMContentLoaded', function () {
              mediumZoom('[data-zoomable]');
            });
          `
        }
      ]
    })

    return tree
  }
}

export default rehypeMediumZoom
