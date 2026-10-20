/**
 * Pure, dependency-free helpers for the file center.
 *
 * The Host half owns all I/O. This module only parses already-recorded tool
 * arguments, normalizes paths inside one Session workspace, folds repeated
 * occurrences of the same file, and ranks in-memory search records. Keeping
 * these functions pure makes the security boundary and the search behavior
 * testable without a running Harness.
 */

import { createHash } from 'node:crypto'
import path from 'node:path'

/** The longest path accepted from a recorded tool call. */
export const MAX_PATH_CHARS = 1024

/** The most searchable text retained for one file record. */
export const MAX_RECORD_TEXT = 32 * 1024

/** The number of occurrences retained per file record. */
export const MAX_OCCURRENCES = 20

/** Full-content hashes are computed only below this source size. */
export const MAX_FULL_HASH_BYTES = 8 * 1024 * 1024

/** Largest page one search request may return. */
export const MAX_SEARCH_PAGE = 100

/** Tools whose successful calls directly name a file. */
export const FILE_TOOLS = new Set(['write', 'edit', 'present', 'str_replace_editor'])

/**
 * Normalize line endings before comparing text files. Windows writes may use
 * CRLF while the recorded tool argument uses LF; that is not a content change.
 * @param {string} value - text.
 * @returns {string} text with `\n` line endings.
 */
export function normalizeLineEndings(value) {
  return typeof value === 'string' ? value.replace(/\r\n?/gu, '\n') : ''
}

/**
 * Hash a write's complete content, but only while it is small enough to hash
 * safely. Larger sources keep their exact byte size and are compared by size
 * only.
 *
 * @param {string} content - complete `write` content, before display clipping.
 * @returns {{bytes: number, hashKind: 'full'|'size-only', hash?: string}|undefined}
 */
export function contentFingerprint(content) {
  if (typeof content !== 'string' || content.length === 0) return undefined
  const normalized = normalizeLineEndings(content)
  const bytes = Buffer.byteLength(normalized, 'utf8')
  if (bytes > MAX_FULL_HASH_BYTES) return { bytes, hashKind: 'size-only' }
  return {
    bytes,
    hashKind: 'full',
    hash: createHash('sha256').update(normalized, 'utf8').digest('hex'),
  }
}

/**
 * Hash one byte buffer for current-file comparison.
 * @param {Uint8Array} bytes - complete file bytes.
 * @returns {string} SHA-256 hex digest.
 */
export function bytesFingerprint(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

/**
 * Decode a text byte buffer and fingerprint it after line-ending
 * normalization. Returns undefined for binary content.
 * @param {Uint8Array} bytes - complete file bytes.
 * @returns {{bytes: number, hash: string}|undefined}
 */
export function textFingerprint(bytes) {
  if (bytes.includes(0)) return undefined
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const normalized = normalizeLineEndings(text)
  return {
    bytes: Buffer.byteLength(normalized, 'utf8'),
    hash: createHash('sha256').update(normalized, 'utf8').digest('hex'),
  }
}

/** Return true for a JSON object that is not an array. */
export function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parse a recorded tool-call argument string, returning undefined on bad JSON. */
export function parseArguments(raw) {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 4 * 1024 * 1024) return undefined
  try {
    const value = JSON.parse(raw)
    return isRecord(value) ? value : undefined
  } catch {
    return undefined
  }
}

/** Return the first non-empty string among the given values. */
function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) return value
  }
  return undefined
}

/** Cap text and remove NULs without changing its meaning. */
export function cleanText(value, limit = MAX_RECORD_TEXT) {
  if (typeof value !== 'string') return ''
  return value.replaceAll('\u0000', '').slice(0, limit)
}

/**
 * Resolve a recorded path against one Session workspace.
 *
 * The index never admits a path outside the Session's working directory.
 * Absolute paths, parent traversal, URLs, home shorthands, NULs, and device
 * paths are rejected before any filesystem call. This is a lexical guard;
 * `fileState` performs the symlink and resolved-containment checks when a
 * record is opened.
 */
export function resolveWorkspacePath(cwd, raw) {
  if (typeof cwd !== 'string' || !path.isAbsolute(cwd)) return undefined
  if (typeof raw !== 'string') return undefined
  const value = raw.trim()
  if (value.length === 0 || value.length > MAX_PATH_CHARS) return undefined
  if (value.includes('\u0000')) return undefined
  // Reject URLs and device schemes, but keep Windows drive paths such as D:\work.
  if (/^[a-z][a-z\d+.-]*:/iu.test(value) && !/^[a-z]:[\\/]/iu.test(value)) return undefined
  if (value === '~' || value.startsWith('~/') || value.startsWith('~\\')) return undefined

  let absolute
  try {
    absolute = path.resolve(cwd, value)
  } catch {
    return undefined
  }
  const relative = path.relative(cwd, absolute)
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return undefined
  }
  return absolute
}

/** Slash-separated path shown to the user. */
export function toDisplayPath(cwd, absolutePath) {
  const relative = path.relative(cwd, absolutePath)
  if (relative.length === 0) return path.basename(absolutePath).split(path.sep).join('/')
  const normalized = relative.split(path.sep).join('/')
  return normalized.length > 0 ? normalized : path.basename(absolutePath).split(path.sep).join('/')
}

/** Stable, opaque reference id for one Session/file pair. */
export function fileIdentity(sessionId, absolutePath) {
  const identityPath = process.platform === 'win32' ? absolutePath.toLowerCase() : absolutePath
  const digest = createHash('sha1').update(`${sessionId}\u0000${identityPath}`).digest('hex')
  return `fh_${digest.slice(0, 16)}`
}

/**
 * Extract the files one successful tool call produced or changed.
 *
 * Coverage is deliberately explicit: `write`, `edit`, `present`, and
 * `str_replace_editor`. Shell commands are not guessed, so input files merely
 * mentioned by a command never enter the index. A successful result's
 * `meta.path` is authoritative when the call omitted a path.
 *
 * @param {string} tool - the recorded wire tool name.
 * @param {Record<string, unknown>} args - parsed call arguments.
 * @param {unknown} meta - the recorded result metadata, if any.
 * @returns {Array<{rawPath: string, kind: string, description: string, content: string}>}
 */
export function extractFileCandidates(tool, args, meta) {
  const candidates = []
  const seen = new Set()
  const add = (rawPath, kind, description = '', content = '') => {
    if (typeof rawPath !== 'string' || rawPath.trim().length === 0) return
    const key = `${kind}\u0000${rawPath.trim()}`
    if (seen.has(key)) return
    seen.add(key)
    const fingerprint = kind === 'written' ? contentFingerprint(content) : undefined
    candidates.push({
      rawPath: rawPath.trim(),
      kind,
      description: cleanText(description, 500),
      content: cleanText(content, MAX_RECORD_TEXT),
      ...(fingerprint === undefined ? {} : { fingerprint }),
    })
  }

  const metaPath = isRecord(meta) && typeof meta.path === 'string' ? meta.path : undefined

  if (tool === 'write') {
    add(firstString(metaPath, args.file_path, args.path), 'written', '', args.content)
  } else if (tool === 'edit') {
    add(firstString(metaPath, args.file_path, args.path), 'modified', '', args.new_string)
  } else if (tool === 'str_replace_editor') {
    const content = firstString(args.file_text, args.new_str, args.new_string)
    add(firstString(metaPath, args.path, args.file_path), 'modified', '', content)
  } else if (tool === 'present') {
    if (Array.isArray(args.files)) {
      for (const entry of args.files) {
        if (!isRecord(entry)) continue
        add(entry.path, 'delivered', firstString(entry.description, entry.title) ?? '')
      }
    }
    if (candidates.length === 0) add(metaPath, 'delivered')
  }

  return candidates
}

/** Collapse runs of whitespace into one space, for UI snippets. */
export function collapseWhitespace(value) {
  return typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : ''
}

/** Find a bounded excerpt around the first matching search token. */
export function excerpt(text, needles, radius = 120) {
  const source = collapseWhitespace(text)
  if (source.length === 0) return ''
  const lower = source.toLowerCase()
  let index = -1
  for (const needle of needles) {
    if (typeof needle !== 'string' || needle.length === 0) continue
    const found = lower.indexOf(needle)
    if (found >= 0 && (index < 0 || found < index)) index = found
  }
  if (index < 0) {
    return source.length > radius * 2 ? `${source.slice(0, radius * 2)}…` : source
  }
  const start = Math.max(0, index - radius)
  const end = Math.min(source.length, index + radius)
  return `${start > 0 ? '…' : ''}${source.slice(start, end)}${end < source.length ? '…' : ''}`
}

/** Lowercase, deduplicated search tokens with a conservative bound. */
export function searchTokens(query) {
  if (typeof query !== 'string') return []
  const tokens = query.trim().toLowerCase().split(/\s+/u).filter(Boolean).slice(0, 8)
  return [...new Set(tokens)]
}

/**
 * Build one file record. Records are grouped by Session, then by canonical
 * path, so repeated edits become occurrences of the same file instead of
 * duplicate rows.
 */
export function createFileRecord({ sessionId, cwd, absolutePath, candidate, occurrence }) {
  return {
    id: fileIdentity(sessionId, absolutePath),
    sessionId,
    cwd,
    absolutePath,
    displayPath: toDisplayPath(cwd, absolutePath),
    name: path.basename(absolutePath),
    extension: path.extname(absolutePath).replace(/^\./u, '').toLowerCase(),
    kind: candidate.kind,
    delivered: candidate.kind === 'delivered',
    description: candidate.description,
    text: cleanText(candidate.content, MAX_RECORD_TEXT),
    createdAt: occurrence.at,
    updatedAt: occurrence.at,
    firstSeq: occurrence.callSeq,
    lastSeq: occurrence.callSeq,
    latest: occurrence,
    occurrences: [occurrence],
    totalOccurrences: 1,
    ...(candidate.fingerprint === undefined
      ? {}
      : {
          writeBaseline: {
            ...candidate.fingerprint,
            at: occurrence.at,
            callSeq: occurrence.callSeq,
            seq: occurrence.seq,
          },
        }),
  }
}

/**
 * Fold one new occurrence into a record.
 *
 * @returns {{record: object, addedText: string, duplicate: boolean}}
 */
export function appendOccurrence(record, candidate, occurrence) {
  const duplicate = record.occurrences.some(
    (item) => item.callSeq === occurrence.callSeq && item.kind === occurrence.kind && item.seq === occurrence.seq,
  )
  if (duplicate) return { record, addedText: '', duplicate: true }

  record.occurrences.push(occurrence)
  record.totalOccurrences = (record.totalOccurrences ?? record.occurrences.length) + 1
  if (record.occurrences.length > MAX_OCCURRENCES) record.occurrences.shift()
  if (occurrence.callSeq >= record.latest.callSeq) record.latest = occurrence
  record.kind = record.latest.kind
  record.delivered = record.delivered || candidate.kind === 'delivered'
  record.updatedAt = Math.max(record.updatedAt, occurrence.at)
  record.firstSeq = Math.min(record.firstSeq, occurrence.callSeq)
  record.lastSeq = Math.max(record.lastSeq, occurrence.callSeq)
  if (candidate.description.length > 0) record.description = candidate.description
  if (candidate.kind === 'written' && candidate.fingerprint !== undefined) {
    record.writeBaseline = {
      ...candidate.fingerprint,
      at: occurrence.at,
      callSeq: occurrence.callSeq,
      seq: occurrence.seq,
    }
  }

  const text = cleanText(candidate.content, MAX_RECORD_TEXT)
  let addedText = ''
  if (text.length > 0 && record.text.length < MAX_RECORD_TEXT) {
    addedText = text.slice(0, MAX_RECORD_TEXT - record.text.length)
    record.text = `${record.text}${record.text.length > 0 ? '\n' : ''}${addedText}`.slice(0, MAX_RECORD_TEXT)
  }
  return { record, addedText, duplicate: false }
}

/**
 * Rank file records against an all-tokens-must-match query and paginate the
 * ranked matches.
 *
 * @param {Array<{record: object, sessionTitle: string}>} entries
 * @param {string} query
 * @param {{offset?: number, limit?: number}} [options]
 * @returns {{
 *   results: Array<{record: object, sessionTitle: string, score: number, snippet: string, matched: object}>,
 *   total: number,
 *   offset: number,
 *   limit: number,
 *   hasMore: boolean,
 *   nextOffset: number|null,
 *   sessions: Array<{id: string, title: string, count: number}>,
 *   tokens: string[],
 * }}
 */
export function searchEntries(entries, query, options = {}) {
  const tokens = searchTokens(query)
  const offset = Number.isSafeInteger(options.offset) && options.offset > 0 ? options.offset : 0
  const limit = Number.isSafeInteger(options.limit) && options.limit > 0
    ? Math.min(options.limit, MAX_SEARCH_PAGE)
    : 50
  if (tokens.length === 0) {
    return {
      results: [],
      total: 0,
      offset,
      limit,
      hasMore: false,
      nextOffset: null,
      sessions: [],
      tokens,
    }
  }

  const matches = []
  for (const entry of entries) {
    const { record, sessionTitle } = entry
    const name = record.name.toLowerCase()
    const display = record.displayPath.toLowerCase()
    const title = (sessionTitle ?? '').toLowerCase()
    const description = record.description.toLowerCase()
    const text = record.text.toLowerCase()
    let score = 0
    let matchedAll = true

    for (const token of tokens) {
      let hit = false
      if (name.includes(token)) {
        score += name === token ? 140 : name.startsWith(token) ? 90 : 60
        hit = true
      }
      if (display.includes(token)) {
        score += 35
        hit = true
      }
      if (title.includes(token)) {
        score += 25
        hit = true
      }
      if (description.includes(token)) {
        score += 18
        hit = true
      }
      if (text.includes(token)) {
        score += 10
        hit = true
      }
      if (!hit) {
        matchedAll = false
        break
      }
    }
    if (!matchedAll) continue
    matches.push({
      record,
      sessionTitle,
      score: score + Math.min(record.occurrences.length, 5) * 2,
    })
  }

  matches.sort((left, right) => right.score - left.score || right.record.updatedAt - left.record.updatedAt)

  const sessionCounts = new Map()
  for (const match of matches) {
    const current = sessionCounts.get(match.record.sessionId)
    sessionCounts.set(match.record.sessionId, {
      id: match.record.sessionId,
      title: match.sessionTitle,
      count: (current?.count ?? 0) + 1,
    })
  }

  const page = matches.slice(offset, offset + limit).map((match) => ({
    ...match,
    snippet:
      excerpt(match.record.text, tokens) ||
      excerpt(match.record.description, tokens) ||
      `${match.record.displayPath}`,
    matched: match.record.latest,
  }))
  const end = offset + page.length
  return {
    results: page,
    total: matches.length,
    offset,
    limit,
    hasMore: end < matches.length,
    nextOffset: end < matches.length ? end : null,
    sessions: [...sessionCounts.values()].sort((left, right) => right.count - left.count),
    tokens,
  }
}

/** Convert a record to the bounded shape sent to the browser or a tool result. */
export function publicRecord(record, sessionTitle, snippet) {
  return {
    id: record.id,
    sessionId: record.sessionId,
    sessionTitle,
    name: record.name,
    extension: record.extension,
    path: record.displayPath,
    absolutePath: record.absolutePath,
    kind: record.delivered ? 'delivered' : record.kind,
    delivered: record.delivered,
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    firstSeq: record.firstSeq,
    lastSeq: record.lastSeq,
    occurrenceCount: record.totalOccurrences ?? record.occurrences.length,
    latest: record.latest,
    occurrences: record.occurrences.slice(-MAX_OCCURRENCES),
    ...(record.writeBaseline === undefined
      ? {}
      : {
          sourceBaseline: {
            bytes: record.writeBaseline.bytes,
            hashKind: record.writeBaseline.hashKind,
            at: record.writeBaseline.at,
            callSeq: record.writeBaseline.callSeq,
          },
        }),
    ...(typeof snippet === 'string' && snippet.length > 0 ? { snippet } : {}),
  }
}
