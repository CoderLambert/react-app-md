import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { rgPath} from '@vscode/ripgrep'
export interface SearchResult {
  filePath: string;
  matches: {
    lineText: string;
    matchText: string;
    range: [number, number][];
    leadingContextLines?: string[];
    trailingContextLines?: string[];
  }[];
}



export interface SearchOptions {
  didMatch?: (result: SearchResult) => void;
  didSearchPaths?: (numPaths: number) => void;
  inclusions?: string[];
  exclusions?: string[];
  noIgnore?: boolean;
  followSymlinks?: boolean;
  isWholeWord?: boolean;
  isRegexp?: boolean;
  isCaseSensitive?: boolean;
  maxFileSize?: number;
  includeHidden?: boolean;
  leadingContextLineCount?: number;
  trailingContextLineCount?: number;
}

class RipgrepDirectorySearcher {
  protected rgPath: string;

  constructor(rg?: string) {
    // // "vscode-ripgrep" is unpacked out of asar because of the binary.
    const rgDiskPath = rgPath.replace(/\bapp\.asar\b/, 'app.asar.unpacked')
    this.rgPath = rg || rgDiskPath;
    console.log(this.rgPath)
  }

  search(directories: string[], pattern: string, options: SearchOptions): { cancel: () => void } & Promise<void> {
    const numPathsFound = { num: 0 };

    const allPromises = directories.map((directory) =>
      this.searchInDirectory(directory, pattern, options, numPathsFound)
    );

    const promise = Promise.all(allPromises) as unknown as Promise<void>;

    (promise as any).cancel = () => {
      for (const p of allPromises) {
        (p as any).cancel();
      }
    };

    return promise as { cancel: () => void } & Promise<void>;
  }

  protected searchInDirectory(
    directoryPath: string,
    pattern: string,
    options: SearchOptions,
    numPathsFound: { num: number }
  ): { cancel: () => void } & Promise<void> {
    let regexpStr: string | null = null;
    let textPattern: string | null = null;
    const args: Array<string> = ['--json'];

    if (options.isRegexp) {
      regexpStr = this.prepareRegexp(pattern);
      args.push('--regexp', regexpStr);
    } else {
      args.push('--fixed-strings');
      textPattern = pattern;
    }

    if (regexpStr && this.isMultilineRegexp(regexpStr)) {
      args.push('--multiline');
    }

    if (options.isCaseSensitive) {
      args.push('--case-sensitive');
    } else {
      args.push('--ignore-case');
    }
    if (options.isWholeWord) {
      args.push('--word-regexp');
    }
    if (options.followSymlinks) {
      args.push('--follow');
    }
    if (options.maxFileSize) {
      args.push('--max-filesize', options.maxFileSize + '');
    }
    if (options.includeHidden) {
      args.push('--hidden');
    }
    if (options.noIgnore) {
      args.push('--no-ignore');
    }

    if (options.leadingContextLineCount) {
      args.push('--before-context', String(options.leadingContextLineCount));
    }
    if (options.trailingContextLineCount) {
      args.push('--after-context', String(options.trailingContextLineCount));
    }
    for (const inclusion of this.prepareGlobs(options.inclusions || [], directoryPath)) {
      args.push('--iglob', inclusion);
    }
    for (const exclusion of this.prepareGlobs(options.exclusions || [], directoryPath)) {
      args.push('--iglob', '!' + exclusion);
    }

    args.push('--');

    if (textPattern) {
      args.push(textPattern);
    }

    args.push(directoryPath);

    let child: ChildProcess;
    try {
      child = spawn(this.rgPath, args, {
        cwd: directoryPath,
        stdio: ['pipe', 'pipe', 'pipe'],
    //     如果子进程衍生时 stdio[2] 被设置为 'pipe'，那么 subprocess.stderr 将是一个可读流，你可以通过它来读取子进程的错误输出。
    //
    // 如果 stdio[2] 被设置为其他值（如 'ignore'、'inherit' 或一个文件描述符），那么 subprocess.stderr 将是 null。

        // stdio 也可以是一个字符串，表示对所有三个流（stdin、stdout、stderr）使用相同的配置。常见的值有：
//         'pipe'	对所有三个流使用管道。
// 'ignore'	忽略所有三个流。
// 'inherit'	所有三个流继承自父进程。
      });
    } catch (err) {
      return Promise.reject(err) as any;
    }

    const didMatch = options.didMatch || (() => {});
    let cancelled = false;

    const returnedPromise = new Promise<void>((resolve, reject) => {
      let buffer = '';
      let bufferError = '';
      let pendingEvent: SearchResult | null = null;
      let pendingLeadingContext: string[] = [];
      let pendingTrailingContexts: Set<string[]> = new Set();

      child.on('close', (code) => {
        // code 1 is used when no results are found.
        if (code !== null && code > 1) {
          reject(new Error(bufferError));
        } else {
          resolve();
        }
      });
      child.on('error', (err) => {
        reject(err);
      });

      child.stderr!.on('data', (chunk) => {
        bufferError += chunk;
      });

      child.stdout!.on('data', (chunk) => {
        if (cancelled) {
          return;
        }

        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const message = JSON.parse(line);
          if (message.type === 'begin') {
            pendingEvent = {
              filePath: getText(message.data.path),
              matches: [],
            };
            pendingLeadingContext = [];
            pendingTrailingContexts = new Set();
          } else if (message.type === 'match') {
            const trailingContextLines: string[] = [];
            pendingTrailingContexts.add(trailingContextLines);
            processUnicodeMatch(message.data);
            for (const submatch of message.data.submatches) {
              const { lineText, range } = processSubmatch(
                submatch,
                getText(message.data.lines),
                message.data.line_number - 1
              );

              pendingEvent!.matches.push({
                matchText: getText(submatch.match),
                lineText,
                range,
                leadingContextLines: [...pendingLeadingContext],
                trailingContextLines,
              });
            }
          } else if (message.type === 'end') {
            if (options.didSearchPaths) {
              options.didSearchPaths(++numPathsFound.num);
            }
            if (pendingEvent) {
              didMatch(pendingEvent);
            }
            pendingEvent = null;
          }
        }
      });
    });

    (returnedPromise as any).cancel = () => {
      child.kill();
      cancelled = true;
    };

    return returnedPromise as { cancel: () => void } & Promise<void>;
  }

    protected prepareGlobs(globs: string[], projectRootPath: string): string[] {
    const output: string[] = [];

    for (let pattern of globs) {
      // we need to replace path separators by slashes since globs should
      // always use always slashes as path separators.
      pattern = pattern.replace(new RegExp(`\\${path.sep}`, 'g'), '/');

      if (pattern.length === 0) {
        continue;
      }

      const projectName = path.basename(projectRootPath);

      // The user can just search inside one of the opened projects. When we detect
      // this scenario we just consider the glob to include every file.
      if (pattern === projectName) {
        output.push('**/*');
        continue;
      }

      if (pattern.startsWith(projectName + '/')) {
        pattern = pattern.slice(projectName.length + 1);
      }

      if (pattern.endsWith('/')) {
        pattern = pattern.slice(0, -1);
      }

      pattern = pattern.startsWith('**/') ? pattern : `**/${pattern}`;

      output.push(pattern);
      output.push(pattern.endsWith('/**') ? pattern : `${pattern}/**`);
    }

    return output;
  }

  private prepareRegexp(regexpStr: string): string {
    // ripgrep handles `--` as the arguments separator, so we need to escape it if the
    // user searches for that exact same string.
    if (regexpStr === '--') {
      return '\\-\\-';
    }

    // ripgrep is quite picky about unnecessarily escaped sequences, so we need to unescape
    // them: https://github.com/BurntSushi/ripgrep/issues/434.
    regexpStr = regexpStr.replace(/\\\//g, '/');

    return regexpStr;
  }

  private isMultilineRegexp(regexpStr: string): boolean {
    return regexpStr.includes('\\n');
  }
}

function cleanResultLine(resultLine: { text?: string; bytes?: string }): string {
  const text = getText(resultLine);
  return text[text.length - 1] === '\n' ? text.slice(0, -1) : text;
}

function getPositionFromColumn(lines: string[], column: number): [number, number] {
  let currentLength = 0;
  let currentLine = 0;
  let previousLength = 0;

  while (column >= currentLength) {
    previousLength = currentLength;
    currentLength += lines[currentLine].length + 1;
    currentLine++;
  }

  return [currentLine - 1, column - previousLength];
}

function processUnicodeMatch(match: { lines: { text?: string; bytes?: string }; submatches: any[] }): void {
  const text = getText(match.lines);

  if (text.length === Buffer.byteLength(text)) {
    // fast codepath for lines that only contain characters of 1 byte length.
    return;
  }

  let remainingBuffer = Buffer.from(text);
  let currentLength = 0;
  let previousPosition = 0;

  function convertPosition(position: number): number {
    const currentBuffer = remainingBuffer.slice(0, position - previousPosition);
    currentLength = currentBuffer.toString().length + currentLength;
    remainingBuffer = remainingBuffer.slice(position - previousPosition);

    previousPosition = position;

    return currentLength;
  }

  // Iterate over all the submatches to find the convert the start and end values
  // (which come as bytes from ripgrep) to character positions.
  // We can do this because submatches come ordered by position.
  for (const submatch of match.submatches) {
    submatch.start = convertPosition(submatch.start);
    submatch.end = convertPosition(submatch.end);
  }
}

function processSubmatch(
  submatch: { start: number; end: number; match: { text?: string; bytes?: string } },
  lineText: string,
  offsetRow: number
): { lineText: string; range: [number, number][] } {
  const lineParts = lineText.split('\n');

  const start = getPositionFromColumn(lineParts, submatch.start);
  const end = getPositionFromColumn(lineParts, submatch.end);

  // Make sure that the lineText string only contains lines that are
  // relevant to this submatch. This means getting rid of lines above
  // the start row and below the end row.
  for (let i = start[0]; i > 0; i--) {
    lineParts.shift();
  }
  while (end[0] < lineParts.length - 1) {
    lineParts.pop();
  }

  start[0] += offsetRow;
  end[0] += offsetRow;

  return {
    range: [start, end],
    lineText: cleanResultLine({ text: lineParts.join('\n') }),
  };
}

function getText(input: { text?: string; bytes?: string }): string {
  return 'text' in input ? input.text! : Buffer.from(input.bytes!, 'base64').toString();
}

export default RipgrepDirectorySearcher;
