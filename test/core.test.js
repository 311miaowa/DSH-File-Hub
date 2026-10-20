import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

import {
  appendOccurrence,
  createFileRecord,
  extractFileCandidates,
  fileIdentity,
  parseArguments,
  publicRecord,
  resolveWorkspacePath,
  searchEntries,
  searchTokens,
} from '../core.js'

const cwd = process.platform === 'win32' ? 'C:\\work\\demo' : '/work/demo'
const inside = path.join(cwd, 'reports', 'summary.md')

function occurrence(overrides = {}) {
  return {
    seq: 12,
    callSeq: 10,
    callId: 'call-1',
    turn: 2,
    step: 1,
    tool: 'write',
    kind: 'written',
    at: 1_700_000_000_000,
    description: '',
    ...overrides,
  }
}

test('resolves only paths inside the Session workspace', () => {
  assert.equal(resolveWorkspacePath(cwd, 'reports/summary.md'), inside)
  assert.equal(resolveWorkspacePath(cwd, '../outside.md'), undefined)
  assert.equal(resolveWorkspacePath(cwd, path.resolve(cwd, '..', 'outside.md')), undefined)
  assert.equal(resolveWorkspacePath(cwd, 'https://example.test/file.md'), undefined)
  assert.equal(resolveWorkspacePath(cwd, 'file:///tmp/a.md'), undefined)
  assert.equal(resolveWorkspacePath(cwd, '~/a.md'), undefined)
  assert.equal(resolveWorkspacePath(cwd, ''), undefined)
  assert.equal(resolveWorkspacePath(cwd, 'a\u0000b.md'), undefined)
  if (process.platform === 'win32') {
    assert.equal(resolveWorkspacePath(cwd, inside), inside)
    assert.equal(resolveWorkspacePath(cwd, path.join(cwd, 'reports', 'summary.md')), inside)
    assert.equal(resolveWorkspacePath(cwd, 'D:\\work\\outside.md'), undefined)
  }
})

test('extracts write, edit, present and str_replace_editor candidates', () => {
  assert.deepEqual(
    extractFileCandidates('write', { file_path: 'notes/a.md', content: 'hello' }, undefined).map((item) => [item.rawPath, item.kind, item.content]),
    [['notes/a.md', 'written', 'hello']],
  )
  const [writeCandidate] = extractFileCandidates('write', { file_path: 'notes/a.md', content: 'hello' }, undefined)
  assert.equal(writeCandidate.fingerprint.bytes, 5)
  assert.equal(writeCandidate.fingerprint.hashKind, 'full')
  assert.match(writeCandidate.fingerprint.hash, /^[a-f0-9]{64}$/u)

  const crlf = extractFileCandidates('write', { file_path: 'notes/a.md', content: 'line1\r\nline2' }, undefined)[0]
  const lf = extractFileCandidates('write', { file_path: 'notes/a.md', content: 'line1\nline2' }, undefined)[0]
  assert.equal(crlf.fingerprint.bytes, lf.fingerprint.bytes)
  assert.equal(crlf.fingerprint.hash, lf.fingerprint.hash)

  assert.deepEqual(
    extractFileCandidates('edit', { file_path: 'notes/a.md', old_string: 'a', new_string: 'b' }, undefined).map((item) => [item.rawPath, item.kind, item.content]),
    [['notes/a.md', 'modified', 'b']],
  )
  assert.deepEqual(
    extractFileCandidates('present', { files: [{ path: 'out/report.docx', description: 'Quarterly report' }] }, undefined).map((item) => [item.rawPath, item.kind, item.description]),
    [['out/report.docx', 'delivered', 'Quarterly report']],
  )
  assert.deepEqual(
    extractFileCandidates('str_replace_editor', { path: 'notes/a.md', new_str: 'c' }, undefined).map((item) => [item.rawPath, item.kind]),
    [['notes/a.md', 'modified']],
  )
  assert.deepEqual(extractFileCandidates('bash', { command: 'echo hi > a.md' }, { path: 'a.md' }), [])
})

test('uses result metadata path when the call omits it', () => {
  const [candidate] = extractFileCandidates('write', { content: 'x' }, { path: 'meta/a.md' })
  assert.equal(candidate.rawPath, 'meta/a.md')
})

test('parses only object-shaped JSON arguments', () => {
  assert.deepEqual(parseArguments('{"a":1}'), { a: 1 })
  assert.equal(parseArguments('[1,2]'), undefined)
  assert.equal(parseArguments('not json'), undefined)
  assert.equal(parseArguments(''), undefined)
})

test('builds a stable opaque reference and folds repeated occurrences', () => {
  const candidate = extractFileCandidates('write', { file_path: 'reports/summary.md', content: 'alpha beta' }, undefined)[0]
  const record = createFileRecord({
    sessionId: 'session-a',
    cwd,
    absolutePath: inside,
    candidate,
    occurrence: occurrence(),
  })
  assert.equal(record.id, fileIdentity('session-a', inside))
  assert.match(record.id, /^fh_[a-f0-9]{16}$/u)
  assert.equal(record.text, 'alpha beta')
  assert.equal(record.occurrences.length, 1)
  assert.equal(record.writeBaseline.bytes, 10)
  assert.equal(record.writeBaseline.hashKind, 'full')

  const added = appendOccurrence(record, { ...candidate, kind: 'modified', content: 'gamma', fingerprint: undefined }, occurrence({ seq: 20, callSeq: 18, kind: 'modified', tool: 'edit', at: 1_700_000_001_000 }))
  assert.equal(added.duplicate, false)
  assert.equal(record.text, 'alpha beta\ngamma')
  assert.equal(record.kind, 'modified')
  assert.equal(record.latest.callSeq, 18)
  assert.equal(record.totalOccurrences, 2)

  const duplicate = appendOccurrence(record, candidate, occurrence({ seq: 20, callSeq: 18, kind: 'modified', tool: 'edit', at: 1_700_000_001_000 }))
  assert.equal(duplicate.duplicate, true)
  assert.equal(record.occurrences.length, 2)
})

test('marks delivered records and bounded public shape', () => {
  const record = createFileRecord({
    sessionId: 'session-a',
    cwd,
    absolutePath: inside,
    candidate: { rawPath: 'reports/summary.md', kind: 'delivered', description: 'Final', content: '' },
    occurrence: occurrence({ kind: 'delivered', tool: 'present' }),
  })
  const output = publicRecord(record, 'Quarterly report')
  assert.equal(output.kind, 'delivered')
  assert.equal(output.delivered, true)
  assert.equal(output.sessionTitle, 'Quarterly report')
  assert.equal(output.occurrences.length, 1)
  assert.ok(!Object.hasOwn(output, 'text'))
})

test('requires every search token, reports total matches and paginates', () => {
  const record = createFileRecord({
    sessionId: 'session-a',
    cwd,
    absolutePath: inside,
    candidate: extractFileCandidates('write', { file_path: 'reports/summary.md', content: 'North wind and solar output' }, undefined)[0],
    occurrence: occurrence(),
  })
  const secondPath = path.join(cwd, 'reports', 'second.md')
  const second = createFileRecord({
    sessionId: 'session-a',
    cwd,
    absolutePath: secondPath,
    candidate: extractFileCandidates('write', { file_path: 'reports/second.md', content: 'wind turbine notes' }, undefined)[0],
    occurrence: occurrence({ callSeq: 30, seq: 31 }),
  })
  const entries = [
    { record, sessionTitle: 'Energy planning' },
    { record: second, sessionTitle: 'Energy planning' },
  ]

  assert.deepEqual(searchTokens('  North   WIND  north '), ['north', 'wind'])
  const page = searchEntries(entries, 'wind solar', { limit: 10 })
  assert.equal(page.total, 1)
  assert.equal(page.results.length, 1)
  assert.equal(page.results[0].record.id, record.id)
  assert.match(page.results[0].snippet, /wind/iu)
  assert.deepEqual(searchEntries(entries, 'wind missing', { limit: 10 }).results, [])
  assert.equal(searchEntries(entries, '', { limit: 10 }).total, 0)

  const firstPage = searchEntries(entries, 'wind', { limit: 1 })
  assert.equal(firstPage.total, 2)
  assert.equal(firstPage.results.length, 1)
  assert.equal(firstPage.hasMore, true)
  assert.equal(firstPage.nextOffset, 1)
  const secondPage = searchEntries(entries, 'wind', { limit: 1, offset: firstPage.nextOffset })
  assert.equal(secondPage.results.length, 1)
  assert.equal(secondPage.hasMore, false)
  assert.equal(secondPage.nextOffset, null)
})
