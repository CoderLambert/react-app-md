import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// clsx：用于根据条件组合多个类名。
// twMerge：来自 tailwind-merge，用于合并和去重 Tailwind CSS 类名，确保生成的类名是最优的。

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
