export { assert }
export { assertUsage }
export { assertWarning }

import { projectInfo } from './projectInfo'

const errorPrefix = `[${projectInfo.npmPackageName}@${projectInfo.projectVersion}]` as const
const internalErrorPrefix = `${errorPrefix}[Bug]` as const
const usageErrorPrefix = `${errorPrefix}[Wrong Usage]` as const
const warningPrefix = `${errorPrefix}[Warning]` as const

function assert(condition: unknown, debugInfo?: unknown): asserts condition {
  if (condition) {
    return
  }

  const debugStr = (() => {
    if (!debugInfo) {
      return ''
    }
    const debugInfoSerialized = typeof debugInfo === 'string' ? debugInfo : '`' + JSON.stringify(debugInfo) + '`'
    return `Debug info (this is for the ${projectInfo.projectName} maintainers; you can ignore this): ${debugInfoSerialized}.`
  })()

  const internalError = new Error(
    [
      `${internalErrorPrefix} You stumbled upon a bug in ${projectInfo.projectName}'s source code.`,
      `Reach out at ${projectInfo.githubRepository}/issues/new and include this error stack (the error stack is usually enough to fix the problem).`,
      'A maintainer will fix the bug (usually under 24 hours).',
      `Do not hesitate to reach out as it makes ${projectInfo.projectName} more robust.`,
      debugStr,
    ].join(' '),
  )

  throw internalError
}

function assertUsage(condition: unknown, errorMessage: string): asserts condition {
  if (condition) {
    return
  }
  const whiteSpace = errorMessage.startsWith('[') ? '' : ' '
  const usageError = new Error(`${usageErrorPrefix}${whiteSpace}${errorMessage}`)
  throw usageError
}

let alreadyLogged: Set<string> = new Set()
function assertWarning(
  condition: unknown,
  errorMessage: string,
  { onlyOnce, showStackTrace }: { onlyOnce: boolean | string; showStackTrace?: true },
): void {
  if (condition) {
    return
  }
  const msg = `${warningPrefix} ${errorMessage}`
  if (onlyOnce) {
    const key = onlyOnce === true ? msg : onlyOnce
    if (alreadyLogged.has(key)) {
      return
    } else {
      alreadyLogged.add(key)
    }
  }
  if (showStackTrace) {
    console.warn(new Error(msg))
  } else {
    console.warn(msg)
  }
}
