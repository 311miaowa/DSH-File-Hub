import assert from 'node:assert/strict'
import path from 'node:path'
import { Readable, Writable } from 'node:stream'
import test from 'node:test'

import { apply, explorerTarget, launchVisible } from '../index.js'

const cwd = process.platform === 'win32' ? 'C:\\work' : '/work'

function makeHeader(id = 'session-demo') {
  return {
    version: 4,
    id,
    createdAt: 1_700_000_000_000,
    cwd,
    isSeeded: false,
    delegationDepth: 0,
  }
}

function event(type, seq, data, time = seq) {
  return { type, seq, time, data }
}

function userEvent(seq, text) {
  return event('user/message', seq, {
    role: 'user',
    source: { kind: 'user' },
    content: [{ type: 'text', text }],
  })
}

function writePair({ callSeq, resultSeq, callId, filePath, content }) {
  return [
    event('tool/call', callSeq, {
      turn: 1,
      step: 1,
      callId,
      name: 'write',
      arguments: JSON.stringify({ file_path: filePath, content }),
    }),
    event('tool/result', resultSeq, {
      turn: 1,
      step: 1,
      message: {
        role: 'tool',
        source: { kind: 'tool', callId },
        toolCallId: callId,
        content: [{ type: 'text', text: 'Created file' }],
        isError: false,
      },
      meta: { path: filePath },
    }),
  ]
}

function makeFiles() {
  return new Map()
}

function makeFs(files) {
  const root = { targetKey: cwd, displayPath: cwd }
  const targetOf = (value) => ({ targetKey: value, displayPath: value })
  const infoOf = (value) => {
    const content = files.get(value)
    if (content === undefined) return undefined
    return { type: 'file', version: `v:${Buffer.byteLength(content, 'utf8')}`, size: Buffer.byteLength(content, 'utf8') }
  }
  const absolute = (value, opts = {}) => path.resolve(opts.cwd ?? cwd, value)
  return {
    resolve: async (value, opts = {}) => {
      const resolved = absolute(value, opts)
      return resolved === cwd ? root : targetOf(resolved)
    },
    lstat: async (value, opts = {}) => {
      const resolved = absolute(value, opts)
      if (resolved === cwd) return { type: 'directory', version: 'root' }
      return infoOf(resolved)
    },
    stat: async (target) => (target.displayPath === cwd ? { type: 'directory', version: 'root' } : infoOf(target.displayPath)),
    contains: () => true,
    processPath: (target) => target.displayPath,
    readBytes: async (target, _signal, maxBytes) => {
      const content = files.get(target.displayPath)
      if (content === undefined) throw new Error('missing')
      const bytes = Buffer.from(content, 'utf8')
      if (bytes.length > maxBytes) throw new Error('too large')
      return bytes
    },
    readByteRange: async (target, range) => {
      const content = files.get(target.displayPath)
      if (content === undefined) throw new Error('missing')
      return Buffer.from(content, 'utf8').subarray(range.offset, range.offset + range.length)
    },
  }
}

function makeHarness({ events, files, title = 'Demo conversation', rejection } = {}) {
  const header = makeHeader()
  const routes = new Map()
  const actionRoutes = new Map()
  const listeners = new Map()
  const tools = new Map()
  const disposers = []
  const warnings = []
  const spawned = []
  const fs = makeFs(files)
  const sessionQuery = {
    listSessions: async () => [{ header, live: false, persisted: true }],
    readTitleSnapshots: async (ids) => ids.map((sessionId) => ({
      sessionId,
      status: 'fulfilled',
      value: { session: header, title: { title } },
    })),
    readSession: async () => ({ session: header, inheritedEventCount: 0, events }),
    readEvent: async ({ seq, before = 0, after = 0 }) => ({
      session: header,
      inheritedEventCount: 0,
      target: events.find((item) => item.seq === seq),
      events: events.filter((item) => item.seq >= seq - before && item.seq <= seq + after),
      startSeq: Math.max(1, seq - before),
      endSeq: seq + after,
    }),
    filterEvents: async () => [{ sessionId: header.id, seq: 1, type: 'user/message', text: 'Build a note' }],
    readTitle: async () => ({ title: { title } }),
  }
  const connection = {
    requestRejection: () => rejection,
    fetch: {
      register(route) {
        routes.set(route.path, route)
        return async () => {}
      },
    },
  }
  const webServer = {
    register(route) {
      actionRoutes.set(route.path, route)
      return () => {}
    },
  }
  const launcher = async (command, args, options) => {
    spawned.push({ command, args, options })
  }
  const ctx = {
    logger: { warn(message) { warnings.push(String(message)) }, info() {} },
    on(name, listener) {
      listeners.set(name, listener)
      return () => {}
    },
    effect(setup) {
      const cleanup = setup()
      if (typeof cleanup === 'function') disposers.push(cleanup)
      return cleanup
    },
    get(name) {
      if (name === 'fs') return fs
      if (name === 'connection') return connection
      if (name === 'webServer') return webServer
      if (name === 'fileHubLauncher') return launcher
      if (name === 'sessions') return { list: () => [], get: () => undefined }
      return undefined
    },
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
        return () => {}
      },
    },
    sessionQuery,
  }

  apply(ctx, { prewarm: false })
  return { routes, actionRoutes, listeners, tools, fs, header, events, files, warnings, spawned }
}

async function callRoute(routes, pathname, url) {
  const route = routes.get(pathname)
  assert.ok(route, `route ${pathname} is registered`)
  const response = await route.fetch(new Request(url))
  return { response, body: await response.json() }
}

async function callActionRoute(actionRoutes, pathname, body) {
  const route = actionRoutes.get(pathname)
  assert.ok(route, `action route ${pathname} is registered`)
  const payload = Buffer.from(JSON.stringify(body))
  const req = Readable.from([payload])
  req.method = 'POST'
  req.headers = {
    'content-type': 'application/json',
    'content-length': String(payload.length),
  }
  const chunks = []
  const res = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk))
      callback()
    },
  })
  res.statusCode = 200
  res.headers = {}
  res.setHeader = (name, value) => {
    res.headers[String(name).toLowerCase()] = String(value)
  }
  await route.handler(req, res)
  const text = Buffer.concat(chunks).toString('utf8')
  return { status: res.statusCode, headers: res.headers, body: text.length > 0 ? JSON.parse(text) : undefined }
}

test('registers the tool and read-only routes, and reports accurate pagination', async () => {
  const events = [
    userEvent(1, 'Build two notes'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'hello' }),
    ...writePair({ callSeq: 4, resultSeq: 5, callId: 'call-b', filePath: 'notes/b.md', content: 'hello world' }),
  ]
  const files = makeFiles()
  files.set(path.join(cwd, 'notes', 'a.md'), 'hello')
  files.set(path.join(cwd, 'notes', 'b.md'), 'hello world')
  const { routes, tools } = makeHarness({ events, files })
  const tool = tools.get('file_hub')
  assert.ok(tool)

  const first = await tool.execute({ action: 'search', query: 'hello', limit: 1 })
  assert.equal(first.totalMatched, 2)
  assert.equal(first.returned, 1)
  assert.equal(first.hasMore, true)
  assert.equal(first.nextOffset, 1)
  assert.equal(first.results.length, 1)

  const second = await tool.execute({ action: 'search', query: 'hello', limit: 1, offset: first.nextOffset })
  assert.equal(second.totalMatched, 2)
  assert.equal(second.returned, 1)
  assert.equal(second.hasMore, false)
  assert.equal(second.nextOffset, null)

  const routed = await callRoute(
    routes,
    '/api/filehub.search',
    'http://localhost/api/filehub.search?q=hello&limit=1&offset=0',
  )
  assert.equal(routed.response.status, 200)
  assert.equal(routed.body.totalMatched, 2)
  assert.equal(routed.body.returned, 1)
  assert.equal(routed.body.hasMore, true)

  const sessions = await callRoute(routes, '/api/filehub.sessions', 'http://localhost/api/filehub.sessions')
  assert.equal(sessions.body.sessions[0].title, 'Demo conversation')
  assert.equal(sessions.body.sessions[0].fileCount, 2)

  const filesPage = await callRoute(
    routes,
    '/api/filehub.files',
    `http://localhost/api/filehub.files?sessionId=${encodeURIComponent('session-demo')}`,
  )
  assert.equal(filesPage.body.files.length, 2)
  assert.ok(filesPage.body.files.every((file) => file.path.startsWith('notes/')))

  assert.equal(routes.size, 4)
  assert.deepEqual(
    tool.parameters.properties.offset,
    { type: 'integer', minimum: 0, description: 'Zero-based result offset for action "search" (default 0). Use nextOffset for the next page.' },
  )
})

test('paginates a conversation file list in pages of ten', async () => {
  const events = [userEvent(1, 'Create many notes')]
  for (let index = 0; index < 12; index += 1) {
    const suffix = String(index).padStart(2, '0')
    events.push(...writePair({
      callSeq: 2 + index * 2,
      resultSeq: 3 + index * 2,
      callId: `call-${suffix}`,
      filePath: `notes/f-${suffix}.md`,
      content: `hello ${suffix}`,
    }))
  }
  const { routes } = makeHarness({ events, files: makeFiles() })
  const url = 'http://localhost/api/filehub.files?sessionId=session-demo&limit=10&offset=0'
  const first = await callRoute(routes, '/api/filehub.files', url)
  assert.equal(first.response.status, 200)
  assert.equal(first.body.totalFiles, 12)
  assert.equal(first.body.files.length, 10)
  assert.equal(first.body.returned, 10)
  assert.equal(first.body.hasMore, true)
  assert.equal(first.body.nextOffset, 10)

  const second = await callRoute(
    routes,
    '/api/filehub.files',
    'http://localhost/api/filehub.files?sessionId=session-demo&limit=10&offset=10',
  )
  assert.equal(second.body.totalFiles, 12)
  assert.equal(second.body.files.length, 2)
  assert.equal(second.body.hasMore, false)
  assert.equal(second.body.nextOffset, null)

  const defaultPage = await callRoute(
    routes,
    '/api/filehub.files',
    'http://localhost/api/filehub.files?sessionId=session-demo',
  )
  assert.equal(defaultPage.body.files.length, 10)
  assert.equal(defaultPage.body.hasMore, true)
})

test('opens the containing folder through the authenticated POST route', async () => {
  const events = [
    userEvent(1, 'Create a note'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'hello' }),
  ]
  const files = makeFiles()
  const absolute = path.join(cwd, 'notes', 'a.md')
  files.set(absolute, 'hello')
  const { actionRoutes, tools, spawned } = makeHarness({ events, files })
  const tool = tools.get('file_hub')
  const found = await tool.execute({ action: 'search', query: 'hello' })
  const ref = found.results[0].ref

  const result = await callActionRoute(actionRoutes, '/api/filehub.folder', { id: ref })
  assert.equal(result.status, 200)
  assert.equal(result.body.ok, true)
  assert.equal(spawned.length, 1)
  const invocation = spawned[0]
  assert.equal(invocation.options.cwd, path.dirname(absolute))
  assert.equal(invocation.options.detached, true)
  assert.equal(invocation.options.windowsHide, false)
  assert.equal(invocation.options.stdio, 'ignore')
  if (process.platform === 'win32') {
    assert.match(invocation.command, /explorer\.exe$/u)
    assert.match(invocation.args[0], /^file:\/\/\//u)
    assert.ok(invocation.args[0].includes('notes'))
  } else {
    assert.equal(invocation.args[0], path.dirname(absolute))
  }
  assert.ok(!invocation.args.includes(absolute))

  const invalid = await callActionRoute(actionRoutes, '/api/filehub.folder', { id: 'not-a-ref' })
  assert.equal(invalid.status, 400)

  const denied = makeHarness({
    events,
    files,
    rejection: 403,
  })
  const rejected = await callActionRoute(denied.actionRoutes, '/api/filehub.folder', { id: ref })
  assert.equal(rejected.status, 403)
})

test('settles a visible launcher success and a missing executable failure', async () => {
  const launchCwd = process.cwd()
  await launchVisible(process.execPath, ['-e', 'process.exit(0)'], {
    cwd: launchCwd,
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  })
  await assert.rejects(
    () => launchVisible('dsh-file-hub-command-that-does-not-exist', [], {
      cwd: launchCwd,
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    }),
    (error) => error.code === 'ENOENT' || /ENOENT/u.test(error.message),
  )
})

test('encodes a Windows Explorer folder target', { skip: process.platform !== 'win32' }, () => {
  assert.equal(explorerTarget('C:\\work\\a,b=c'), 'file:///C:/work/a%2Cb%3Dc')
  assert.equal(explorerTarget('C:\\work\\中文'), 'file:///C:/work/中文')
})

test('compares the current file with the latest write baseline', async () => {
  const events = [
    userEvent(1, 'Create a note'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'hello' }),
  ]
  const files = makeFiles()
  const absolute = path.join(cwd, 'notes', 'a.md')
  files.set(absolute, 'hello changed')
  const { routes, tools } = makeHarness({ events, files })
  const tool = tools.get('file_hub')

  const found = await tool.execute({ action: 'search', query: 'hello' })
  const ref = found.results.find((item) => item.name === 'a.md').ref
  const changed = await tool.execute({ action: 'open', ref })
  assert.equal(changed.currentFile.status, 'present')
  assert.equal(changed.currentFile.sourceComparison.status, 'changed')
  assert.equal(changed.currentFile.sourceComparison.reason, 'size')

  files.set(absolute, 'hullo')
  const sameSize = await tool.execute({ action: 'open', ref })
  assert.equal(sameSize.currentFile.sourceComparison.status, 'changed')
  assert.equal(sameSize.currentFile.sourceComparison.reason, 'content')

  files.set(absolute, 'hello')
  const unchanged = await tool.execute({ action: 'open', ref })
  assert.equal(unchanged.currentFile.sourceComparison.status, 'unchanged')
  assert.equal(unchanged.currentFile.sourceComparison.complete, true)

  const routed = await callRoute(
    routes,
    '/api/filehub.file',
    `http://localhost/api/filehub.file?id=${ref}`,
  )
  assert.equal(routed.response.status, 200)
  assert.equal(routed.body.currentFile.sourceComparison.status, 'unchanged')
  assert.equal(routed.body.context.userRequest, 'Build a note')

  files.delete(absolute)
  const missing = await tool.execute({ action: 'open', ref })
  assert.equal(missing.currentFile.status, 'missing')
})

test('treats CRLF and LF as the same text content', async () => {
  const events = [
    userEvent(1, 'Create a note'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'line1\nline2' }),
  ]
  const files = makeFiles()
  files.set(path.join(cwd, 'notes', 'a.md'), 'line1\r\nline2')
  const { tools } = makeHarness({ events, files })
  const tool = tools.get('file_hub')
  const found = await tool.execute({ action: 'search', query: 'line1' })
  const opened = await tool.execute({ action: 'open', ref: found.results[0].ref })
  assert.equal(opened.currentFile.sourceComparison.status, 'unchanged')
})

test('keeps a bounded read-only tool and rejects invalid references', async () => {
  const events = [
    userEvent(1, 'Create a note'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'hello' }),
  ]
  const files = makeFiles()
  files.set(path.join(cwd, 'notes', 'a.md'), 'hello')
  const { routes, tools } = makeHarness({ events, files })
  const tool = tools.get('file_hub')
  const found = await tool.execute({ action: 'search', query: 'hello' })
  const ref = found.results[0].ref
  const opened = await tool.execute({ action: 'open', ref })
  assert.equal(opened.safety.readOnly, true)
  assert.equal(opened.file.sourceBaseline.hashKind, 'full')
  assert.equal(opened.file.sourceBaseline.bytes, 5)
  assert.ok(!Object.hasOwn(opened.file.sourceBaseline, 'hash'))

  await assert.rejects(() => tool.execute({ action: 'open', ref: 'fh_0000000000000000' }), /unknown file reference/u)
  await assert.rejects(() => tool.execute({ action: 'openFolder', ref }), /action must be/u)
  const invalid = await callRoute(
    routes,
    '/api/filehub.file',
    'http://localhost/api/filehub.file?id=not-a-reference',
  )
  assert.equal(invalid.response.status, 400)
})

test('adds new live file calls after the index is ready', async () => {
  const events = [
    userEvent(1, 'Create a note'),
    ...writePair({ callSeq: 2, resultSeq: 3, callId: 'call-a', filePath: 'notes/a.md', content: 'hello' }),
  ]
  const files = makeFiles()
  files.set(path.join(cwd, 'notes', 'a.md'), 'hello')
  const { listeners, tools, header } = makeHarness({ events, files })
  const tool = tools.get('file_hub')
  await tool.execute({ action: 'search', query: 'hello' })

  const session = { id: header.id, header }
  const call = event('tool/call', 10, {
    turn: 2,
    step: 1,
    callId: 'call-live',
    name: 'write',
    arguments: JSON.stringify({ file_path: 'notes/live.md', content: 'live-only note' }),
  })
  const result = event('tool/result', 11, {
    turn: 2,
    step: 1,
    message: {
      role: 'tool',
      source: { kind: 'tool', callId: 'call-live' },
      toolCallId: 'call-live',
      content: [{ type: 'text', text: 'Created file' }],
      isError: false,
    },
    meta: { path: 'notes/live.md' },
  })
  events.push(call, result)
  listeners.get('session/event')(session, call)
  listeners.get('session/event')(session, result)

  const found = await tool.execute({ action: 'search', query: 'live-only' })
  assert.equal(found.totalMatched, 1)
  assert.equal(found.results[0].name, 'live.md')
})
