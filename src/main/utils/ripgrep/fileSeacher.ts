import { spawn, ChildProcess } from 'child_process';
import RipgrepDirectorySearcher, {SearchOptions} from './ripgrepSearcher';


interface NumPathsFound {
  num: number;
}

class FileSearcher extends RipgrepDirectorySearcher {
  constructor(rg?: string) {
    super(rg);
  }
  searchInDirectory(
    directoryPath: string,
    // @ts-ignore
    pattern: string,
    options: SearchOptions,
    numPathsFound: NumPathsFound
  ): { cancel: () => void } & Promise<void> {
    const args: string[] = ['--files'];

    if (options.followSymlinks) {
      args.push('--follow');
    }
    if (options.includeHidden) {
      args.push('--hidden');
    }
    if (options.noIgnore) {
      args.push('--no-ignore');
    }

    for (const inclusion of this.prepareGlobs(options.inclusions || [], directoryPath)) {
      args.push('--iglob', inclusion);
    }

    args.push('--');
    args.push(directoryPath);

    return this.spawnRipgrepProcess(directoryPath, args, options, numPathsFound);
  }

  private spawnRipgrepProcess(
    directoryPath: string,
    args: string[],
    options: SearchOptions,
    numPathsFound: NumPathsFound
  ): { cancel: () => void } & Promise<void> {
    let child: ChildProcess;
    try {
      child = spawn(this.rgPath, args, {
        cwd: directoryPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (err) {
      const promise = Promise.reject(err) as any;
      promise.cancel = () => {}; // No-op since the process was never spawned
      return promise;
    }

    const didMatch = options.didMatch || (() => {});
    let cancelled = false;

    const returnedPromise = new Promise<void>((resolve, reject) => {
      let buffer = '';
      let bufferError = '';

      // @ts-ignore
      child.on('close', (code, signal) => {
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
        // console.log(lines)
        for (const line of lines) {
          if (options.didSearchPaths) {
            options.didSearchPaths(++numPathsFound.num);
          }
          console.log(line)
          // @ts-ignore
          didMatch(line);
        }
      });
    });

    (returnedPromise as any).cancel = () => {
      child.kill();
      cancelled = true;
    };

    return returnedPromise as { cancel: () => void } & Promise<void>;
  }
}

export default FileSearcher;
