# Test Markdown Document

This document is designed to test the integration of remark and rehype libraries with `App.tsx`, including `remark-math` for rendering mathematical formulas.

## Headings

### Subheading

## Text Formatting

**Bold Text**

*Italic Text*

~~Strikethrough Text~~

## Lists

### Unordered List

- Item 1
- Item 2
- Item 3

### Ordered List

1. First item
2. Second item
3. Third item

## Links

[Google](https://www.google.com)

## Code

### Inline Code

This is an example of `inline code`.

### Code Block

```javascript
function helloWorld() {
  console.log('Hello, world!');
}
```

```ts
// 不启用括号着色

function helloWorld() {
  console.log('Hello, world!');
}
```

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Data 2   |
| Row 2    | Data 3   | Data 4   |

## Blockquotes

> This is a blockquote.

## Horizontal Rule

---

## HTML Integration

<div>
  <p>This is an example of embedded HTML.</p>
</div>

## Mathematical Formulas

### Inline Math

This is an inline math formula: \( E = mc^2 \).

### Block Math

This is a block math formula:

$$
c = \sqrt{a^2 + b^2}
$$

```math
L = \frac{1}{2} \rho v^2 S C_L
```

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

Some references:

- Commit: f8083175fe890cbf14f41d0a06e7aa35d4989587
- Commit (fork): foo@f8083175fe890cbf14f41d0a06e7aa35d4989587
- Commit (repo): remarkjs/remark@e1aa9f6c02de18b9459b7d269712bcb50183ce89
- Issue or PR (`#`): #1
- Issue or PR (`GH-`): GH-1
- Issue or PR (fork): foo#1
- Issue or PR (project): remarkjs/remark#1
- Mention: @wooorm

Some links:

- Commit: <https://github.com/remarkjs/remark/commit/e1aa9f6c02de18b9459b7d269712bcb50183ce89>
- Commit comment: <https://github.com/remarkjs/remark/commit/ac63bc3abacf14cf08ca5e2d8f1f8e88a7b9015c#commitcomment-16372693>
- Issue or PR: <https://github.com/remarkjs/remark/issues/182>
- Issue or PR comment: <https://github.com/remarkjs/remark-github/issues/3#issue-151160339>
- Mention: <https://github.com/ben-eb>
