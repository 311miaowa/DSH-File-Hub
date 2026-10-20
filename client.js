window.__ModuleLoader__.load({
  id: 'dsh-file-hub',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const NS = 'fileHub'
    const PANEL_ID = 'filehub'
    const FILES_PER_PAGE = 10
    const SEARCH_PER_PAGE = 20

    const ZH = {
      panel: '文件中心',
      eyebrow: '跨对话文件索引',
      title: '文件中心',
      subtitle: '按对话归档生成的文件；全局搜索，复制回指继续加工。',
      searchPlaceholder: '搜索文件名、路径、对话标题或内容关键词',
      searchHint: '空格分隔多个关键词，全部命中才会显示。',
      clearSearch: '清除搜索',
      refresh: '刷新',
      retry: '重试',
      conversations: '对话',
      conversationsCount: '{count} 个对话',
      filesCount: '{count} 个文件',
      indexedChars: '{count} 字符已索引',
      loadingTitle: '正在建立文件索引…',
      loadingHint: '首次打开会读取历史会话，只在本机内存中建立索引。',
      errorTitle: '文件中心暂时不可用',
      errorHint: '索引读取失败。请确认插件仍处于启用状态，然后重试。',
      noSessionsTitle: '还没有可归档的文件',
      noSessionsHint: '当对话通过 write、edit 或 present 生成文件后，会自动出现在这里。',
      noFilesTitle: '这个对话还没有归档文件',
      noFilesHint: '成功生成或修改文件的工具调用会出现在这里。',
      searchResults: '搜索结果',
      searchNoResultsTitle: '没有匹配的文件',
      searchNoResultsHint: '试试文件名、路径、对话标题，或生成内容里的关键词。',
      searchFrom: '来自 {count} 个对话',
      searchPageSummary: '第 {page} / {pages} 页 · 共 {total} 条结果',
      filesPageSummary: '第 {page} / {pages} 页 · 共 {total} 个文件',
      pagination: '分页',
      previousPage: '上一页',
      nextPage: '下一页',
      searchTruncated: '结果较多，仅显示前 {count} 个',
      untitled: '未命名对话',
      latest: '最近一次',
      occurrences: '{count} 次出处',
      event: '事件',
      turnLabel: '第 {turn} 轮',
      stepLabel: '第 {step} 步',
      session: '对话',
      path: '文件路径',
      updated: '更新于',
      copiedRef: '回指 ID 已复制',
      copiedPrompt: '继续加工指令已复制',
      copyFailed: '复制失败，请手动选择文本',
      copyRef: '复制回指 ID',
      copyPrompt: '复制继续加工指令',
      openFolder: '打开所在文件夹',
      openingFolder: '正在打开文件夹…',
      folderOpened: '已打开所在文件夹',
      folderOpenFailed: '无法打开所在文件夹',
      refHeader: '文件中心回指：',
      refFile: '文件：',
      refConversation: '来源对话：',
      refOrigin: '出处：',
      promptIntro: '请使用 file_hub 工具（action: "open", ref: "{ref}"{seq}）打开这个文件回指，读取它返回的来源上下文和当前文件，然后在此基础上继续加工。',
      promptFile: '文件：',
      promptSource: '来源：',
      promptGuard: '先检查当前内容并说明计划；不要覆盖原文件，除非我明确确认。',
      sourceContext: '来源上下文',
      originalRequest: '原始请求',
      toolCall: '工具调用',
      toolResult: '工具结果',
      currentFile: '当前文件',
      currentFilePresent: '文件仍在工作区中，{size}',
      currentFileMissing: '文件已不在原路径，历史回指仍然保留。',
      currentFileSymlink: '检测到符号链接，出于安全原因不读取内容。',
      currentFileOutside: '解析后的路径跑出了原对话工作区，已拒绝读取。',
      currentFileUnavailable: '当前部署没有可用的文件系统服务。',
      currentFileError: '无法读取当前文件状态。',
      sourceUnchanged: '与最近一次写入记录一致',
      sourceChanged: '与最近一次写入记录不一致，可能已被后续修改',
      sourceNoBaseline: '没有写入基线，未做内容对比',
      sourceSizeOnly: '文件较大，仅比对了大小',
      sourceUnknown: '未完成内容对比',
      preview: '内容预览',
      noPreview: '没有可显示的预览（二进制、过大或不可读）。',
      history: '历史出处',
      historyHint: '同一文件的每次成功修改都会单独保留一条出处。',
      detailLoading: '正在读取精确出处…',
      detailError: '无法读取更详细的出处，以下信息来自索引记录。',
      kindWritten: '已生成',
      kindModified: '已修改',
      kindDelivered: '已交付',
      indexReady: '索引已就绪',
      indexPartial: '部分索引',
      indexError: '索引异常',
      indexIndexing: '索引中',
      safety: '只读索引 · 路径限制在原对话工作区 · 不读取工作区外的文件',
      closeDetail: '关闭详情',
      partialWarning: '{count} 个会话读取失败，其余结果仍可用。',
      indexedAt: '索引完成于 {time}',
      noContext: '没有可显示的上下文。',
      noOccurrences: '没有更多出处。',
      fileMeta: '{count} 条记录',
      close: '关闭',
      copyPath: '复制路径',
      pathCopied: '路径已复制',
    }

    const EN = {
      panel: 'File Hub',
      eyebrow: 'CROSS-CONVERSATION FILE INDEX',
      title: 'File Hub',
      subtitle: 'Files by conversation, with global search and a source reference for continuing the work.',
      searchPlaceholder: 'Search names, paths, conversation titles or content',
      searchHint: 'Separate terms with spaces; every term must match.',
      clearSearch: 'Clear search',
      refresh: 'Refresh',
      retry: 'Retry',
      conversations: 'Conversations',
      conversationsCount: '{count} conversations',
      filesCount: '{count} files',
      indexedChars: '{count} characters indexed',
      loadingTitle: 'Building the file index…',
      loadingHint: 'The first open reads past conversations and builds an in-memory index on this Host.',
      errorTitle: 'File Hub is unavailable',
      errorHint: 'The index could not be read. Confirm the plugin is still enabled, then retry.',
      noSessionsTitle: 'No archived files yet',
      noSessionsHint: 'Files produced by write, edit or present appear here automatically.',
      noFilesTitle: 'No files in this conversation',
      noFilesHint: 'Tool calls that successfully create or change files appear here.',
      searchResults: 'Search results',
      searchNoResultsTitle: 'No matching files',
      searchNoResultsHint: 'Try a file name, path, conversation title, or a phrase from the generated content.',
      searchFrom: 'From {count} conversations',
      searchPageSummary: 'Page {page} / {pages} · {total} results',
      filesPageSummary: 'Page {page} / {pages} · {total} files',
      pagination: 'Pagination',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      searchTruncated: 'Showing the first {count} matches',
      untitled: 'Untitled conversation',
      latest: 'Latest',
      occurrences: '{count} occurrences',
      event: 'Event',
      turnLabel: 'Turn {turn}',
      stepLabel: 'Step {step}',
      session: 'Conversation',
      path: 'File path',
      updated: 'Updated',
      copiedRef: 'Reference copied',
      copiedPrompt: 'Reprocess prompt copied',
      copyFailed: 'Copy failed; select the text manually',
      copyRef: 'Copy reference',
      copyPrompt: 'Copy reprocess prompt',
      openFolder: 'Open containing folder',
      openingFolder: 'Opening folder…',
      folderOpened: 'Containing folder opened',
      folderOpenFailed: 'Could not open the containing folder',
      refHeader: 'File Hub reference: ',
      refFile: 'File: ',
      refConversation: 'Conversation: ',
      refOrigin: 'Origin: ',
      promptIntro: 'Use the file_hub tool (action: "open", ref: "{ref}"{seq}) to open this reference, read the returned source context and current file, then continue working from it.',
      promptFile: 'File: ',
      promptSource: 'Source: ',
      promptGuard: 'Inspect the current content and state your plan first; do not overwrite the original unless I explicitly confirm.',
      sourceContext: 'Source context',
      originalRequest: 'Original request',
      toolCall: 'Tool call',
      toolResult: 'Tool result',
      currentFile: 'Current file',
      currentFilePresent: 'The file is still in the workspace, {size}',
      currentFileMissing: 'The file is no longer at its original path; the source reference remains.',
      currentFileSymlink: 'A symbolic link was detected; its content is not read for safety.',
      currentFileOutside: 'The resolved path leaves the original workspace and was refused.',
      currentFileUnavailable: 'This deployment has no filesystem service.',
      currentFileError: 'The current file status could not be read.',
      sourceUnchanged: 'Matches the latest recorded write',
      sourceChanged: 'Differs from the latest recorded write; it may have changed later',
      sourceNoBaseline: 'No write baseline; content was not compared',
      sourceSizeOnly: 'The file is large; only its size was compared',
      sourceUnknown: 'Content comparison was not completed',
      preview: 'Content preview',
      noPreview: 'No preview (binary, too large, or unreadable).',
      history: 'Source history',
      historyHint: 'Each successful change keeps its own source reference.',
      detailLoading: 'Reading the exact source…',
      detailError: 'The detailed source could not be read; the fields below come from the index.',
      kindWritten: 'Created',
      kindModified: 'Modified',
      kindDelivered: 'Delivered',
      indexReady: 'Index ready',
      indexPartial: 'Partially indexed',
      indexError: 'Index error',
      indexIndexing: 'Indexing',
      safety: 'Read-only index · paths confined to the original workspace · no reads outside it',
      closeDetail: 'Close details',
      partialWarning: '{count} conversations could not be read; the rest remain available.',
      indexedAt: 'Indexed at {time}',
      noContext: 'No context is available.',
      noOccurrences: 'No more occurrences.',
      fileMeta: '{count} records',
      close: 'Close',
      copyPath: 'Copy path',
      pathCopied: 'Path copied',
    }

    const CSS = `
.fh-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 24px 28px 26px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font: inherit;
}
.fh-root *, .fh-root *::before, .fh-root *::after { box-sizing: border-box; }
.fh-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.fh-heading { min-width: 0; }
.fh-eyebrow {
  margin-bottom: 5px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .13em;
  text-transform: uppercase;
}
.fh-title { margin: 0; font-size: 25px; line-height: 1.2; letter-spacing: -.02em; }
.fh-subtitle { max-width: 680px; margin: 7px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.55; }
.fh-header-actions { display: flex; align-items: center; gap: 8px; flex: none; padding-top: 2px; }
.fh-status {
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 26px; padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px;
  color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1);
  font-size: 11px; white-space: nowrap;
}
.fh-status-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-idle-primary); }
.fh-status.is-ready .fh-status-dot { background: var(--dsw-alias-state-success-primary); }
.fh-status.is-partial .fh-status-dot { background: var(--dsw-alias-state-warn-primary); }
.fh-status.is-error .fh-status-dot { background: var(--dsw-alias-state-error-primary); }
.fh-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 30px; padding: 0 11px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1);
  font: inherit; font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background .12s ease, border-color .12s ease, opacity .12s ease;
}
.fh-btn:hover { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l2); }
.fh-btn:focus-visible, .fh-session:focus-visible, .fh-file-row:focus-visible, .fh-icon-btn:focus-visible, .fh-occurrence:focus-visible, .fh-page:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px;
}
.fh-btn:disabled { cursor: default; opacity: .55; }
.fh-btn-primary { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--dsw-alias-label-primary); font-weight: 600; }
.fh-btn-primary:hover { background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-base); opacity: .9; filter: none; }
.fh-btn-ghost { border-color: transparent; background: transparent; color: var(--dsw-alias-label-secondary); }
.fh-btn-ghost:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.fh-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0;
  border: 1px solid transparent; border-radius: 7px;
  color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer;
}
.fh-icon-btn:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.fh-searchbar {
  display: flex; align-items: center; gap: 9px;
  min-height: 42px; padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px;
  background: var(--dsw-alias-bg-layer-1);
  transition: border-color .12s ease, box-shadow .12s ease;
}
.fh-searchbar:focus-within { border-color: var(--dsw-alias-brand-primary); }
.fh-searchbar svg { flex: none; color: var(--dsw-alias-label-secondary); }
.fh-search-input {
  flex: 1; min-width: 0; height: 38px; padding: 0;
  border: 0; outline: 0; color: var(--dsw-alias-label-primary); background: transparent;
  font: inherit; font-size: 13px;
}
.fh-search-input::placeholder { color: var(--dsw-alias-label-secondary); }
.fh-search-note { flex: none; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.fh-summary {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-top: -2px; color: var(--dsw-alias-label-secondary); font-size: 11px;
}
.fh-summary-sep { opacity: .45; }
.fh-summary-safety { margin-left: auto; text-align: right; }
.fh-body { display: grid; grid-template-columns: 254px minmax(0, 1fr); gap: 14px; flex: 1; min-height: 0; }
.fh-sessions {
  display: flex; flex-direction: column; min-height: 0;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 13px;
  background: var(--dsw-alias-bg-layer-1); overflow: hidden;
}
.fh-sessions-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 12px 12px 8px; color: var(--dsw-alias-label-secondary);
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
}
.fh-sessions-list { display: flex; flex-direction: column; gap: 3px; min-height: 0; overflow: auto; padding: 2px 7px 9px; }
.fh-session {
  display: flex; align-items: flex-start; gap: 9px; width: 100%;
  padding: 9px 8px; border: 1px solid transparent; border-radius: 9px;
  color: var(--dsw-alias-label-primary); background: transparent;
  text-align: left; font: inherit; cursor: pointer;
}
.fh-session:hover { background: var(--dsw-alias-bg-layer-2); }
.fh-session.is-selected { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
.fh-session-icon { flex: none; margin-top: 1px; color: var(--dsw-alias-label-secondary); }
.fh-session.is-selected .fh-session-icon { color: var(--dsw-alias-brand-primary); }
.fh-session-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.fh-session-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 500; line-height: 1.4; }
.fh-session-meta { color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 1.3; }
.fh-content { display: flex; flex-direction: column; min-width: 0; min-height: 0; gap: 10px; }
.fh-content.is-detail { display: grid; grid-template-columns: minmax(0, 1fr) 378px; align-items: start; gap: 14px; }
.fh-list-pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; gap: 10px; }
.fh-pane-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 2px 1px; }
.fh-pane-title { margin: 0; font-size: 15px; font-weight: 600; line-height: 1.35; }
.fh-pane-sub { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.45; }
.fh-list {
  display: flex; flex-direction: column; gap: 7px;
  min-height: 0; overflow: auto; padding: 1px 1px 6px;
}
.fh-file-row {
  display: grid; grid-template-columns: 38px minmax(0, 1fr) 16px; gap: 10px; align-items: start;
  width: 100%; padding: 11px 12px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1);
  text-align: left; font: inherit; cursor: pointer;
  transition: background .12s ease, border-color .12s ease, transform .12s ease;
}
.fh-file-row:hover { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l2); }
.fh-file-row.is-selected { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
.fh-file-chevron { align-self: center; color: var(--dsw-alias-label-secondary); opacity: .7; }
.fh-file-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.fh-file-top { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; min-width: 0; }
.fh-file-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 600; }
.fh-file-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); font: 11px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; }
.fh-file-session { display: inline-flex; align-items: center; gap: 4px; color: var(--dsw-alias-label-secondary); font-size: 10px; }
.fh-file-snippet {
  display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
  margin-top: 3px; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.5;
}
.fh-file-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 10px; }
.fh-file-meta code { font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; }
.fh-kind {
  display: inline-flex; align-items: center; min-height: 19px; padding: 0 6px;
  border-radius: 999px; font-size: 10px; font-weight: 600; white-space: nowrap;
  color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2);
}
.fh-kind.is-delivered { color: var(--dsw-alias-brand-primary); }
.fh-kind.is-modified { color: var(--dsw-alias-state-warn-primary); }
.fh-kind.is-written { color: var(--dsw-alias-state-success-primary); }
.fh-tile {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 9px;
  color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2);
  font: 700 9px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
  letter-spacing: .03em;
}
.fh-tile.is-doc { color: var(--dsw-alias-brand-primary); }
.fh-tile.is-sheet { color: var(--dsw-alias-state-success-primary); }
.fh-tile.is-slide { color: var(--dsw-alias-state-warn-primary); }
.fh-tile.is-image { color: var(--dsw-alias-state-idle-primary); }
.fh-detail {
  display: flex; flex-direction: column; gap: 12px; min-width: 0;
  max-height: calc(100vh - 210px); overflow: auto;
  padding: 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 13px;
  background: var(--dsw-alias-bg-layer-1);
}
.fh-detail-head { display: flex; align-items: flex-start; gap: 9px; }
.fh-detail-head-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.fh-detail-name { margin: 0; font-size: 14px; font-weight: 650; line-height: 1.35; overflow-wrap: anywhere; }
.fh-detail-path { color: var(--dsw-alias-label-secondary); font: 10px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
.fh-detail-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.fh-detail-actions .fh-btn { flex: 1 1 auto; font-size: 11px; padding: 0 8px; }
.fh-detail-badges { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.fh-session-chip {
  display: inline-flex; align-items: center; gap: 4px; max-width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--dsw-alias-label-secondary); font-size: 10px;
}
.fh-meta { display: flex; flex-direction: column; gap: 7px; margin: 0; padding: 10px 0; border-top: 1px solid var(--dsw-alias-border-l1); border-bottom: 1px solid var(--dsw-alias-border-l1); }
.fh-meta-row { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 8px; align-items: start; }
.fh-meta dt { color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 1.5; }
.fh-meta dd { margin: 0; min-width: 0; color: var(--dsw-alias-label-primary); font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
.fh-meta code { font: 10px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
.fh-detail-section { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.fh-detail-section h3 { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.fh-context-block { display: flex; flex-direction: column; gap: 3px; }
.fh-context-label { color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 600; }
.fh-pre {
  max-height: 150px; margin: 0; overflow: auto; padding: 8px 9px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base);
  font: 10px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.fh-warning { margin: 0; padding: 7px 8px; border-radius: 7px; color: var(--dsw-alias-state-warn-primary); background: var(--dsw-alias-bg-layer-2); font-size: 10px; line-height: 1.45; }
.fh-ok { margin: 0; padding: 7px 8px; border-radius: 7px; color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-bg-layer-2); font-size: 10px; line-height: 1.45; }
.fh-error { margin: 0; padding: 7px 8px; border-radius: 7px; color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-2); font-size: 10px; line-height: 1.45; }
.fh-occurrences { display: flex; flex-direction: column; gap: 4px; }
.fh-occurrence {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center;
  width: 100%; padding: 6px 7px; border: 1px solid transparent; border-radius: 7px;
  color: var(--dsw-alias-label-primary); background: transparent; text-align: left; font: inherit; cursor: pointer;
}
.fh-occurrence:hover { background: var(--dsw-alias-bg-layer-2); }
.fh-occurrence.is-active { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
.fh-occurrence-main { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.fh-occurrence-time { color: var(--dsw-alias-label-secondary); font-size: 9px; white-space: nowrap; }
.fh-skeleton { display: flex; flex-direction: column; gap: 7px; padding: 3px 1px; }
.fh-skeleton-row { height: 66px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); opacity: .65; animation: fh-pulse 1.3s ease-in-out infinite; }
.fh-skeleton-row.short { height: 42px; }
@keyframes fh-pulse { 0%, 100% { opacity: .45; } 50% { opacity: .8; } }
@media (prefers-reduced-motion: reduce) { .fh-skeleton-row { animation: none; } }
.fh-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 230px; padding: 28px; border: 1px dashed var(--dsw-alias-border-l1); border-radius: 13px; color: var(--dsw-alias-label-secondary); text-align: center; }
.fh-empty-glyph { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
.fh-empty-title { margin: 2px 0 0; color: var(--dsw-alias-label-primary); font-size: 13px; font-weight: 600; }
.fh-empty-text { max-width: 360px; margin: 0; font-size: 11px; line-height: 1.55; }
.fh-inline-error { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); font-size: 11px; }
.fh-toast {
  position: fixed; right: 28px; bottom: 26px; z-index: 20;
  display: inline-flex; align-items: center; gap: 6px; max-width: min(360px, calc(100vw - 48px));
  padding: 8px 11px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 8px 26px rgb(0 0 0 / 18%); font-size: 11px; line-height: 1.4;
}
.fh-toast.is-error { color: var(--dsw-alias-state-error-primary); }
.fh-toast-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-success-primary); }
.fh-toast.is-error .fh-toast-dot { background: var(--dsw-alias-state-error-primary); }
.fh-muted { color: var(--dsw-alias-label-secondary); }
.fh-mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.fh-mark { border-radius: 3px; color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
.fh-spin { animation: fh-spin .9s linear infinite; }
@keyframes fh-spin { to { transform: rotate(360deg); } }
@media (max-width: 1040px) {
  .fh-content.is-detail { display: flex; flex-direction: column; }
  .fh-detail { width: 100%; max-height: none; }
}
@media (max-width: 800px) {
  .fh-root { padding: 18px 16px 20px; }
  .fh-header { flex-direction: column; gap: 10px; }
  .fh-header-actions { width: 100%; justify-content: flex-end; }
  .fh-body { display: flex; flex-direction: column; }
  .fh-sessions { max-height: 190px; }
  .fh-sessions-list { flex-direction: row; overflow-x: auto; }
  .fh-session { min-width: 178px; }
  .fh-summary-safety { width: 100%; margin-left: 0; text-align: left; }
}

/* Quiet, compact presentation. These rules deliberately override the first
   draft's card-heavy treatment; the markup stays unchanged where possible. */
.fh-root { padding: 22px 24px 24px; gap: 12px; }
.fh-header { align-items: center; }
.fh-eyebrow, .fh-summary, .fh-detail-badges, .fh-file-meta, .fh-file-chevron { display: none; }
.fh-status { display: inline-flex; align-items: center; gap: 5px; min-height: 0; padding: 0; border: 0; border-radius: 0; color: var(--dsw-alias-label-secondary); background: transparent; font-size: 10px; }
.fh-status-dot { width: 5px; height: 5px; }
.fh-title { font-size: 20px; font-weight: 600; letter-spacing: -.01em; }
.fh-subtitle { max-width: 620px; margin-top: 4px; font-size: 12px; line-height: 1.5; opacity: .82; }
.fh-header-actions { padding-top: 0; }
.fh-btn { min-height: 28px; padding: 0 9px; border-color: transparent; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.fh-btn:hover { border-color: transparent; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.fh-btn-primary { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--dsw-alias-label-primary); font-weight: 600; }
.fh-btn-primary:hover { border-color: transparent; background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-base); opacity: .9; filter: none; }
.fh-searchbar { min-height: 38px; padding: 0 11px; border-radius: 9px; background: var(--dsw-alias-bg-layer-1); }
.fh-searchbar:focus-within { border-color: var(--dsw-alias-border-l2); box-shadow: none; }
.fh-search-input { height: 34px; font-size: 12px; }
.fh-search-note { display: none; }
.fh-body { grid-template-columns: 220px minmax(0, 1fr); gap: 18px; }
.fh-sessions { border: 0; border-radius: 0; background: transparent; }
.fh-sessions-head { padding: 0 8px 8px; font-size: 10px; font-weight: 500; }
.fh-sessions-list { gap: 1px; padding: 0; }
.fh-session { align-items: center; gap: 7px; padding: 8px; border: 0; border-radius: 7px; }
.fh-session.is-selected { border-color: transparent; background: var(--dsw-alias-bg-layer-2); }
.fh-session-icon { opacity: .55; }
.fh-session.is-selected .fh-session-icon { color: var(--dsw-alias-label-secondary); }
.fh-session-title { font-size: 12px; font-weight: 500; }
.fh-session-meta { font-size: 10px; opacity: .65; }
.fh-content { gap: 10px; }
.fh-content.is-detail { grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; }
.fh-list-pane { gap: 8px; }
.fh-pane-head { align-items: center; padding: 0 2px 2px; }
.fh-pane-title { font-size: 14px; font-weight: 600; }
.fh-pane-sub { margin-top: 3px; font-size: 10px; opacity: .75; }
.fh-pane-head .fh-btn { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); }
.fh-pane-head .fh-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.fh-list { flex: 1; min-height: 0; gap: 0; padding: 0; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); overflow: auto; }
.fh-file-row { grid-template-columns: 32px minmax(0, 1fr); gap: 10px; align-items: center; padding: 12px 14px; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); border-radius: 0; background: transparent; }
.fh-file-row:last-child { border-bottom: 0; }
.fh-file-row:hover { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
.fh-file-row.is-selected { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
.fh-pagination { display: flex; flex: none; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px; padding: 9px 0 2px; }
.fh-page { min-width: 26px; height: 26px; padding: 0 6px; border: 1px solid transparent; border-radius: 6px; color: var(--dsw-alias-label-secondary); background: transparent; font: inherit; font-size: 11px; cursor: pointer; }
.fh-page:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.fh-page.is-current { border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); font-weight: 600; }
.fh-page:disabled { cursor: default; opacity: .35; }
.fh-page-arrow { font-size: 17px; line-height: 1; }
.fh-page-ellipsis { min-width: 20px; color: var(--dsw-alias-label-secondary); text-align: center; font-size: 11px; opacity: .5; }
.fh-file-main { gap: 2px; }
.fh-file-top { gap: 6px; }
.fh-file-name { font-size: 12.5px; font-weight: 550; }
.fh-file-sub { display: flex; align-items: center; gap: 7px; min-width: 0; }
.fh-file-session { display: inline-flex; flex: none; max-width: 42%; align-items: center; gap: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; opacity: .8; }
.fh-file-path { flex: 1; min-width: 0; overflow: hidden; color: var(--dsw-alias-label-secondary); font: 10px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; text-overflow: ellipsis; white-space: nowrap; opacity: .78; }
.fh-file-snippet { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 1; margin-top: 1px; font-size: 10.5px; line-height: 1.45; opacity: .76; }
.fh-kind { min-height: 0; padding: 0; color: var(--dsw-alias-label-secondary); background: transparent; font-size: 9px; font-weight: 400; opacity: .65; }
.fh-kind.is-delivered, .fh-kind.is-modified, .fh-kind.is-written { color: var(--dsw-alias-label-secondary); }
.fh-tile { width: 32px; height: 32px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; color: var(--dsw-alias-label-secondary); background: transparent; font-size: 8px; }
.fh-tile.is-doc, .fh-tile.is-sheet, .fh-tile.is-slide, .fh-tile.is-image { color: var(--dsw-alias-label-secondary); }
.fh-detail { gap: 8px; max-height: calc(100vh - 190px); padding: 0 0 0 20px; border: 0; border-left: 1px solid var(--dsw-alias-border-l1); border-radius: 0; background: transparent; }
.fh-detail-head { gap: 9px; }
.fh-detail-name { font-size: 13px; font-weight: 600; }
.fh-detail-path { font-size: 10px; opacity: .72; }
.fh-detail-actions { gap: 4px; padding: 2px 0 4px; }
.fh-detail-actions .fh-btn { flex: 0 1 auto; font-size: 11px; }
.fh-detail-actions .fh-btn-primary { flex: 1 1 100%; }
.fh-source-line { padding-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 10.5px; line-height: 1.5; overflow-wrap: anywhere; }
.fh-hint { margin: 0 0 2px; color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 1.45; opacity: .62; }
.fh-detail-section { gap: 5px; }
.fh-disclosure { padding: 9px 0 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.fh-disclosure summary { padding: 1px 0; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 10px; font-weight: 500; list-style: none; }
.fh-disclosure summary::-webkit-details-marker { display: none; }
.fh-disclosure summary::after { float: right; content: '+'; opacity: .65; }
.fh-disclosure[open] summary::after { content: '−'; }
.fh-disclosure-body { display: flex; flex-direction: column; gap: 6px; padding-top: 7px; }
.fh-pre { max-height: 130px; padding: 7px 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); font-size: 10px; line-height: 1.55; }
.fh-warning, .fh-ok, .fh-error { padding: 0; border-radius: 0; background: transparent; font-size: 10px; line-height: 1.45; }
.fh-empty { min-height: 180px; gap: 6px; padding: 24px; border: 0; background: transparent; }
.fh-empty-glyph { width: 32px; height: 32px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.fh-empty-title { font-size: 12px; font-weight: 500; }
.fh-empty-text { font-size: 10.5px; opacity: .8; }
.fh-skeleton-row { height: 56px; border-radius: 8px; opacity: .4; }
.fh-skeleton-row.short { height: 36px; }
.fh-inline-error { padding: 8px 9px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: transparent; font-size: 10.5px; }
.fh-toast { padding: 7px 10px; border: 0; border-radius: 8px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 4px 18px rgb(0 0 0 / 14%); font-size: 10.5px; }
.fh-toast-dot { display: none; }
@media (max-width: 1040px) {
  .fh-content.is-detail { display: flex; flex-direction: column; }
  .fh-detail { width: 100%; max-height: none; padding: 14px 0 0; border-top: 1px solid var(--dsw-alias-border-l1); border-left: 0; }
}
@media (max-width: 800px) {
  .fh-root { padding: 16px; }
  .fh-body { gap: 12px; }
  .fh-sessions { max-height: 160px; }
  .fh-content.is-detail { display: flex; }
}
`

    const INLINE_STYLE = typeof styles === 'undefined' || styles === null || typeof styles.insert !== 'function'

    function InlineStyle() {
      return INLINE_STYLE ? h('style', { 'data-file-hub': 'styles' }, CSS) : null
    }

    function formatTime(value) {      if (!Number.isFinite(value)) return '—'
      try {
        return new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value))
      } catch {
        return new Date(value).toLocaleString()
      }
    }

    function formatBytes(value) {
      if (!Number.isFinite(value) || value < 0) return '—'
      if (value < 1024) return `${value} B`
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
      return `${(value / (1024 * 1024)).toFixed(1)} MB`
    }

    function extensionLabel(extension) {
      const value = typeof extension === 'string' ? extension.toLowerCase() : ''
      if (value.length === 0) return 'FILE'
      if (value === 'docx' || value === 'doc') return 'DOC'
      if (value === 'xlsx' || value === 'xls' || value === 'csv') return 'XLS'
      if (value === 'pptx' || value === 'ppt') return 'PPT'
      if (value === 'pdf') return 'PDF'
      if (value === 'png' || value === 'jpg' || value === 'jpeg' || value === 'webp' || value === 'gif') return 'IMG'
      if (value === 'json' || value === 'jsonl') return 'JSON'
      if (value === 'markdown') return 'MD'
      return value.slice(0, 4).toUpperCase()
    }

    function tileClass(extension) {
      const value = typeof extension === 'string' ? extension.toLowerCase() : ''
      if (['doc', 'docx', 'pdf', 'md', 'markdown', 'txt'].includes(value)) return 'is-doc'
      if (['xls', 'xlsx', 'csv'].includes(value)) return 'is-sheet'
      if (['ppt', 'pptx'].includes(value)) return 'is-slide'
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(value)) return 'is-image'
      return ''
    }

    function FileTypeTile({ file }) {
      return h('span', { className: `fh-tile ${tileClass(file?.extension)}`, 'aria-hidden': true }, extensionLabel(file?.extension))
    }

    function Icon({ name, size = 16 }) {
      const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }
      if (name === 'search') return h('svg', props, h('circle', { cx: 11, cy: 11, r: 6.5 }), h('path', { d: 'm16 16 4.2 4.2' }))
      if (name === 'refresh') return h('svg', props, h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }), h('path', { d: 'M20 5v6h-6' }))
      if (name === 'chat') return h('svg', props, h('path', { d: 'M5 5.5h14v10H9l-4 3v-13Z' }), h('path', { d: 'M8 9h8M8 12.5h5' }))
      if (name === 'file') return h('svg', props, h('path', { d: 'M7 3.5h6l4 4V20H7V3.5Z' }), h('path', { d: 'M13 3.5v4h4M9.5 12h5M9.5 15.5h5' }))
      if (name === 'folder') return h('svg', props, h('path', { d: 'M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z' }))
      if (name === 'chevron') return h('svg', props, h('path', { d: 'm9 5 7 7-7 7' }))
      if (name === 'copy') return h('svg', props, h('rect', { x: 8, y: 8, width: 11, height: 11, rx: 2 }), h('path', { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' }))
      if (name === 'close') return h('svg', props, h('path', { d: 'm6 6 12 12M18 6 6 18' }))
      if (name === 'arrow') return h('svg', props, h('path', { d: 'M5 12h14M13 6l6 6-6 6' }))
      if (name === 'spark') return h('svg', props, h('path', { d: 'm12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z' }), h('path', { d: 'm19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z' }))
      return h('svg', props, h('circle', { cx: 12, cy: 12, r: 8 }))
    }

    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    }

    function Highlight({ text, tokens }) {
      const value = typeof text === 'string' ? text : ''
      const usable = Array.isArray(tokens) ? tokens.filter((token) => typeof token === 'string' && token.length > 0) : []
      if (usable.length === 0) return value
      let pattern
      try {
        pattern = new RegExp(`(${usable.map(escapeRegExp).join('|')})`, 'giu')
      } catch {
        return value
      }
      const lowerTokens = new Set(usable.map((token) => token.toLowerCase()))
      return value.split(pattern).map((part, index) => (
        lowerTokens.has(part.toLowerCase())
          ? h('mark', { key: index, className: 'fh-mark' }, part)
          : part
      ))
    }

    function kindLabel(t, kind) {
      if (kind === 'delivered') return t('kindDelivered')
      if (kind === 'modified') return t('kindModified')
      return t('kindWritten')
    }

    function KindBadge({ t, kind }) {
      return h('span', { className: `fh-kind is-${kind === 'delivered' ? 'delivered' : kind === 'modified' ? 'modified' : 'written'}` }, kindLabel(t, kind))
    }

    function EmptyState({ icon, title, text }) {
      return h('div', { className: 'fh-empty' },
        h('span', { className: 'fh-empty-glyph' }, h(Icon, { name: icon ?? 'folder', size: 20 })),
        h('p', { className: 'fh-empty-title' }, title),
        h('p', { className: 'fh-empty-text' }, text),
      )
    }

    function Skeleton({ rows = 4 }) {
      return h('div', { className: 'fh-skeleton', 'aria-hidden': true },
        Array.from({ length: rows }, (_, index) => h('div', { key: index, className: `fh-skeleton-row ${index === rows - 1 ? 'short' : ''}` })),
      )
    }

    function paginationItems(page, pageCount) {
      if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
      const pages = new Set([1, pageCount, page - 1, page, page + 1])
      if (page <= 4) pages.add(2).add(3).add(4)
      if (page >= pageCount - 3) pages.add(pageCount - 3).add(pageCount - 2).add(pageCount - 1)
      const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)
      const items = []
      let previous = 0
      for (const value of sorted) {
        if (value - previous > 1) items.push('…')
        items.push(value)
        previous = value
      }
      return items
    }

    function Pagination({ page, pageCount, onChange, t }) {
      if (pageCount <= 1) return null
      return h('nav', { className: 'fh-pagination', 'aria-label': t('pagination') },
        h('button', {
          type: 'button',
          className: 'fh-page fh-page-arrow',
          disabled: page <= 1,
          onClick: () => onChange(page - 1),
          title: t('previousPage'),
          'aria-label': t('previousPage'),
        }, '‹'),
        paginationItems(page, pageCount).map((item, index) => (
          item === '…'
            ? h('span', { key: `ellipsis-${index}`, className: 'fh-page-ellipsis', 'aria-hidden': true }, '…')
            : h('button', {
                key: item,
                type: 'button',
                className: `fh-page ${item === page ? 'is-current' : ''}`,
                'aria-current': item === page ? 'page' : undefined,
                onClick: () => onChange(item),
              }, item)
        )),
        h('button', {
          type: 'button',
          className: 'fh-page fh-page-arrow',
          disabled: page >= pageCount,
          onClick: () => onChange(page + 1),
          title: t('nextPage'),
          'aria-label': t('nextPage'),
        }, '›'),
      )
    }

    function StatusPill({ t, stats }) {
      const truncated = stats?.truncated?.sessions || stats?.truncated?.files || stats?.truncated?.text
      const status = truncated ? 'partial' : stats?.status ?? 'indexing'
      if (status === 'ready') return null
      const label = status === 'partial' ? t('indexPartial') : status === 'error' ? t('indexError') : t('indexIndexing')
      return h('span', { className: `fh-status is-${status === 'partial' ? 'partial' : status === 'error' ? 'error' : 'indexing'}` },
        h('span', { className: 'fh-status-dot' }),
        label,
      )
    }

    function SessionRow({ session, selected, onSelect, t }) {
      const title = session.title && session.title !== session.id ? session.title : t('untitled')
      return h('button', {
        type: 'button',
        className: `fh-session ${selected ? 'is-selected' : ''}`,
        onClick: () => onSelect(session.id),
        'aria-pressed': selected,
        title,
      },
        h('span', { className: 'fh-session-icon' }, h(Icon, { name: 'chat', size: 15 })),
        h('span', { className: 'fh-session-main' },
          h('span', { className: 'fh-session-title' }, title),
          h('span', { className: 'fh-session-meta' }, t('filesCount', { count: session.fileCount })),
        ),
      )
    }

    function FileRow({ file, selected, showSession, tokens, onSelect, t }) {
      return h('button', {
        type: 'button',
        className: `fh-file-row ${selected ? 'is-selected' : ''}`,
        onClick: () => onSelect(file),
        'aria-pressed': selected,
        title: file.absolutePath,
      },
        h(FileTypeTile, { file }),
        h('span', { className: 'fh-file-main' },
          h('span', { className: 'fh-file-top' },
            h('span', { className: 'fh-file-name' }, h(Highlight, { text: file.name, tokens })),
            h(KindBadge, { t, kind: file.kind }),
          ),
          h('span', { className: 'fh-file-sub' },
            showSession ? h('span', { className: 'fh-file-session' }, h(Icon, { name: 'chat', size: 10 }), h(Highlight, { text: file.sessionTitle, tokens })) : null,
            h('span', { className: 'fh-file-path' }, h(Highlight, { text: file.path, tokens })),
          ),
          file.snippet ? h('span', { className: 'fh-file-snippet' }, h(Highlight, { text: file.snippet, tokens })) : null,
        ),
      )
    }

    function comparisonLabel(t, comparison) {
      if (!comparison) return ''
      if (comparison.status === 'unchanged') return t('sourceUnchanged')
      if (comparison.status === 'changed') return t('sourceChanged')
      if (comparison.reason === 'no-write-baseline') return t('sourceNoBaseline')
      if (comparison.reason === 'source-too-large' || comparison.reason === 'current-too-large') return t('sourceSizeOnly')
      return t('sourceUnknown')
    }

    function currentFileStatus(t, currentFile) {
      if (!currentFile || currentFile.status === undefined) return null
      if (currentFile.status === 'present') {
        const label = comparisonLabel(t, currentFile.sourceComparison)
        return {
          tone: currentFile.sourceComparison?.status === 'changed'
            ? 'warn'
            : currentFile.sourceComparison?.status === 'unknown'
              ? 'warn'
              : 'ok',
          text: `${t('currentFilePresent', { size: formatBytes(currentFile.bytes) })}${label.length > 0 ? ` · ${label}` : ''}`,
        }
      }
      if (currentFile.status === 'missing') return { tone: 'warn', text: t('currentFileMissing') }
      if (currentFile.status === 'symlink') return { tone: 'warn', text: t('currentFileSymlink') }
      if (currentFile.status === 'outside-workspace') return { tone: 'error', text: t('currentFileOutside') }
      if (currentFile.status === 'unavailable') return { tone: 'warn', text: t('currentFileUnavailable') }
      return { tone: 'error', text: t('currentFileError') }
    }

    function DetailSection({ title, children }) {
      return h('details', { className: 'fh-disclosure' },
        h('summary', {}, title),
        h('div', { className: 'fh-disclosure-body' }, children),
      )
    }

    function ContextBlock({ label, text }) {
      return h('div', { className: 'fh-context-block' },
        h('span', { className: 'fh-context-label' }, label),
        h('pre', { className: 'fh-pre' }, text || '—'),
      )
    }

    function FileDetail({ t, file, detail, detailState, onClose, onCopyRef, onCopyPrompt, onOpenFolder, openingFolder, onSelectOccurrence }) {
      if (!file) return null
      const loaded = detailState.status === 'ready' ? detail : null
      const view = loaded?.file ?? file
      const occurrence = loaded?.occurrence ?? view.latest ?? {}
      const context = loaded?.context ?? null
      const currentFile = loaded?.currentFile ?? null
      const status = currentFileStatus(t, currentFile)
      return h('aside', { className: 'fh-detail', 'aria-label': t('sourceContext') },
        h('div', { className: 'fh-detail-head' },
          h(FileTypeTile, { file: view }),
          h('div', { className: 'fh-detail-head-main' },
            h('h2', { className: 'fh-detail-name' }, view.name),
            h('span', { className: 'fh-detail-path' }, view.path),
          ),
          h('button', { type: 'button', className: 'fh-icon-btn', onClick: onClose, title: t('closeDetail'), 'aria-label': t('closeDetail') }, h(Icon, { name: 'close', size: 14 })),
        ),
        h('div', { className: 'fh-detail-actions' },
          h('button', { type: 'button', className: 'fh-btn fh-btn-primary', onClick: () => onCopyPrompt(view, occurrence) },
            h(Icon, { name: 'spark', size: 13 }), t('copyPrompt')),
          h('button', { type: 'button', className: 'fh-btn', onClick: () => onCopyRef(view, occurrence) },
            h(Icon, { name: 'copy', size: 13 }), t('copyRef')),
          h('button', {
            type: 'button',
            className: 'fh-btn',
            disabled: openingFolder,
            onClick: () => onOpenFolder(view),
          }, h(Icon, { name: 'folder', size: 13 }), openingFolder ? t('openingFolder') : t('openFolder')),
        ),
        h('div', { className: 'fh-source-line' },
          view.sessionTitle,
          ' · ',
          t('turnLabel', { turn: occurrence.turn ?? '—' }),
          ' · ',
          t('event'),
          ` #${occurrence.callSeq ?? '—'}`,
        ),
        status ? h('p', { className: status.tone === 'error' ? 'fh-error' : status.tone === 'ok' ? 'fh-ok' : 'fh-warning' }, status.text) : null,
        loaded?.currentFile?.preview ? h(DetailSection, { title: t('preview') }, h('pre', { className: 'fh-pre' }, loaded.currentFile.preview)) : null,
        h(DetailSection, { title: t('sourceContext') },
          detailState.status === 'loading' ? h('div', { className: 'fh-muted' }, t('detailLoading')) : null,
          detailState.status === 'error' ? h('p', { className: 'fh-error' }, t('detailError')) : null,
          context?.error ? h('p', { className: 'fh-error' }, context.error) : null,
          detailState.status !== 'loading' && context === null ? h('div', { className: 'fh-muted' }, t('noContext')) : null,
          context !== null && !context?.error
            ? h('div', { className: 'fh-context' },
                h(ContextBlock, { label: t('originalRequest'), text: context.userRequest }),
                h(ContextBlock, { label: t('toolCall'), text: context.call ? JSON.stringify(context.call, null, 2) : '' }),
                h(ContextBlock, { label: t('toolResult'), text: context.result }),
              )
            : null,
        ),
        h(DetailSection, { title: t('history') },
          h('div', { className: 'fh-hint' }, t('historyHint')),
          h('div', { className: 'fh-occurrences' },
            (view.occurrences ?? []).slice().reverse().map((item) => h('button', {
              key: `${item.callSeq}-${item.seq}-${item.kind}`,
              type: 'button',
              className: `fh-occurrence ${item.callSeq === occurrence.callSeq ? 'is-active' : ''}`,
              onClick: () => onSelectOccurrence(view, item),
            },
              h('span', { className: 'fh-occurrence-main' }, `#${item.callSeq} · ${t('turnLabel', { turn: item.turn })} · ${kindLabel(t, item.kind)} · ${item.tool}`),
              h('span', { className: 'fh-occurrence-time' }, formatTime(item.at)),
            )),
          ),
        ),
      )
    }

    async function copyText(text) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        return
      }
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!copied) throw new Error('copy command was refused')
    }

    function promptValue(value, limit = 300) {
      return String(value ?? '').replace(/\s+/gu, ' ').trim().slice(0, limit)
    }

    function buildRefText(file, occurrence, t) {
      return [
        `${t('refHeader')}${file.id}`,
        `${t('refFile')}${promptValue(file.absolutePath, 500)}`,
        `${t('refConversation')}${promptValue(file.sessionTitle)} (${promptValue(file.sessionId)})`,
        `${t('refOrigin')}${t('event')} #${occurrence?.callSeq ?? file.latest?.callSeq ?? '—'} · ${t('turnLabel', { turn: occurrence?.turn ?? file.latest?.turn ?? '—' })} · ${t('stepLabel', { step: occurrence?.step ?? file.latest?.step ?? '—' })} · ${occurrence?.tool ?? file.latest?.tool ?? '—'}`,
      ].join('\n')
    }

    function buildPromptText(file, occurrence, t) {
      const seq = occurrence?.callSeq ?? file.latest?.callSeq
      const seqPart = Number.isSafeInteger(seq) ? `, seq: ${seq}` : ''
      return [
        t('promptIntro', { ref: file.id, seq: seqPart }),
        `${t('promptFile')}${promptValue(file.absolutePath, 500)}`,
        `${t('promptSource')}${promptValue(file.sessionTitle)} · ${t('event')} #${seq ?? '—'}`,
        t('promptGuard'),
      ].join('\n')
    }

    function FileHubPanel({ t }) {
      const [sessionsState, setSessionsState] = useState({ status: 'loading', data: null, error: null })
      const [selectedSessionId, setSelectedSessionId] = useState(null)
      const [filesState, setFilesState] = useState({ status: 'idle', data: null, error: null })
      const [query, setQuery] = useState('')
      const [searchState, setSearchState] = useState({ status: 'idle', data: null, error: null })
      const [selectedId, setSelectedId] = useState(null)
      const [focusSeq, setFocusSeq] = useState(null)
      const [detailState, setDetailState] = useState({ status: 'idle', data: null, error: null })
      const [refreshKey, setRefreshKey] = useState(0)
      const [toast, setToast] = useState(null)
      const [filePage, setFilePage] = useState(1)
      const [searchPage, setSearchPage] = useState(1)
      const [openingFolder, setOpeningFolder] = useState(false)
      const toastTimer = useRef(null)

      const showToast = useCallback((message, error = false) => {
        setToast({ message, error })
        if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => setToast(null), 2400)
      }, [])

      useEffect(() => () => {
        if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      }, [])

      useEffect(() => {
        const controller = new AbortController()
        setSessionsState((previous) => ({ status: previous.data ? 'refreshing' : 'loading', data: previous.data, error: null }))
        fetchJson('api/filehub.sessions', controller.signal)
          .then((data) => {
            setSessionsState({ status: 'ready', data, error: null })
            setSelectedSessionId((previous) => {
              if (previous && data.sessions.some((session) => session.id === previous)) return previous
              return data.sessions[0]?.id ?? null
            })
          })
          .catch((error) => {
            if (error.name === 'AbortError') return
            setSessionsState((previous) => ({ status: 'error', data: previous.data, error: error.message }))
          })
        return () => controller.abort()
      }, [refreshKey])

      useEffect(() => {
        setSelectedId(null)
        setFocusSeq(null)
      }, [selectedSessionId, query, filePage, searchPage])

      useEffect(() => {
        if (!selectedSessionId || query.trim().length > 0) {
          setFilesState({ status: 'idle', data: null, error: null })
          return
        }
        const controller = new AbortController()
        setFilesState({ status: 'loading', data: null, error: null })
        const offset = (filePage - 1) * FILES_PER_PAGE
        fetchJson(`api/filehub.files?sessionId=${encodeURIComponent(selectedSessionId)}&limit=${FILES_PER_PAGE}&offset=${offset}`, controller.signal)
          .then((data) => setFilesState({ status: 'ready', data, error: null }))
          .catch((error) => {
            if (error.name === 'AbortError') return
            setFilesState({ status: 'error', data: null, error: error.message })
          })
        return () => controller.abort()
      }, [selectedSessionId, query, refreshKey, filePage])

      useEffect(() => {
        const value = query.trim()
        if (value.length === 0) {
          setSearchState({ status: 'idle', data: null, error: null })
          return
        }
        const controller = new AbortController()
        const timer = window.setTimeout(() => {
          setSearchState((previous) => ({
            status: 'loading',
            data: previous.data?.query === value ? previous.data : null,
            error: null,
          }))
          const offset = (searchPage - 1) * SEARCH_PER_PAGE
          fetchJson(`api/filehub.search?q=${encodeURIComponent(value)}&limit=${SEARCH_PER_PAGE}&offset=${offset}`, controller.signal)
            .then((data) => setSearchState({ status: 'ready', data, error: null }))
            .catch((error) => {
              if (error.name === 'AbortError') return
              setSearchState({ status: 'error', data: null, error: error.message })
            })
        }, 220)
        return () => {
          window.clearTimeout(timer)
          controller.abort()
        }
      }, [query, refreshKey, searchPage])

      const sessions = sessionsState.data?.sessions ?? []
      const stats = sessionsState.data?.stats ?? null
      const selectedSession = useMemo(
        () => sessions.find((session) => session.id === selectedSessionId) ?? null,
        [sessions, selectedSessionId],
      )
      const activeCollection = query.trim().length > 0 ? searchState.data?.results ?? [] : filesState.data?.files ?? []
      const selectedFile = useMemo(
        () => activeCollection.find((file) => file.id === selectedId) ?? null,
        [activeCollection, selectedId],
      )

      useEffect(() => {
        if (!selectedId) {
          setDetailState({ status: 'idle', data: null, error: null })
          return
        }
        const controller = new AbortController()
        setDetailState({ status: 'loading', data: null, error: null })
        const parameters = new URLSearchParams({ id: selectedId })
        if (Number.isSafeInteger(focusSeq)) parameters.set('seq', String(focusSeq))
        fetchJson(`api/filehub.file?${parameters.toString()}`, controller.signal)
          .then((data) => setDetailState({ status: 'ready', data, error: null }))
          .catch((error) => {
            if (error.name === 'AbortError') return
            setDetailState({ status: 'error', data: null, error: error.message })
          })
        return () => controller.abort()
      }, [selectedId, focusSeq, refreshKey])

      const selectFile = useCallback((file, occurrence) => {
        setSelectedId(file.id)
        setFocusSeq(occurrence?.callSeq ?? file.latest?.callSeq ?? null)
      }, [])

      const selectOccurrence = useCallback((file, occurrence) => {
        setSelectedId(file.id)
        setFocusSeq(occurrence.callSeq)
      }, [])

      const copyReference = useCallback(async (file, occurrence) => {
        try {
          await copyText(buildRefText(file, occurrence, t))
          showToast(t('copiedRef'))
        } catch {
          showToast(t('copyFailed'), true)
        }
      }, [showToast, t])

      const copyPrompt = useCallback(async (file, occurrence) => {
        try {
          await copyText(buildPromptText(file, occurrence, t))
          showToast(t('copiedPrompt'))
        } catch {
          showToast(t('copyFailed'), true)
        }
      }, [showToast, t])

      const openFolder = useCallback(async (file) => {
        if (openingFolder) return
        setOpeningFolder(true)
        try {
          await postJson('api/filehub.folder', { id: file.id })
          showToast(t('folderOpened'))
        } catch {
          showToast(t('folderOpenFailed'), true)
        } finally {
          setOpeningFolder(false)
        }
      }, [openingFolder, showToast, t])

      const refresh = useCallback(() => setRefreshKey((value) => value + 1), [])
      const filePageCount = Math.max(1, Math.ceil(
        (filesState.data?.totalFiles ?? selectedSession?.fileCount ?? 0) / FILES_PER_PAGE,
      ))
      const searchPageCount = Math.max(1, Math.ceil(
        (searchState.data?.totalMatched ?? 0) / SEARCH_PER_PAGE,
      ))

      useEffect(() => {
        if (filesState.status === 'ready' && filePage > filePageCount) setFilePage(filePageCount)
      }, [filePage, filePageCount, filesState.status])

      useEffect(() => {
        if (searchState.status === 'ready' && searchPage > searchPageCount) setSearchPage(searchPageCount)
      }, [searchPage, searchPageCount, searchState.status])

      const searching = query.trim().length > 0
      const searchTokens = searchState.data?.tokens ?? []
      const bodyStatus = sessionsState.status
      const hasSessions = sessions.length > 0

      if (!sessionsState.data && (bodyStatus === 'loading' || bodyStatus === 'refreshing')) {
        return h('div', { className: 'fh-root' },
          h(InlineStyle),
          h('header', { className: 'fh-header' },
            h('div', { className: 'fh-heading' },
              h('div', { className: 'fh-eyebrow' }, t('eyebrow')),
              h('h1', { className: 'fh-title' }, t('title')),
              h('p', { className: 'fh-subtitle' }, t('subtitle')),
            ),
            h('div', { className: 'fh-header-actions' }, h(StatusPill, { t, stats }), h('button', { type: 'button', className: 'fh-btn', onClick: refresh }, h(Icon, { name: 'refresh', size: 13 }), t('refresh'))),
          ),
          h('div', { className: 'fh-body' },
            h('div', { className: 'fh-list-pane' },
              h(EmptyState, { icon: 'folder', title: t('loadingTitle'), text: t('loadingHint') }),
              h(Skeleton, { rows: 4 }),
            ),
          ),
        )
      }

      if (!sessionsState.data && bodyStatus === 'error') {
        return h('div', { className: 'fh-root' },
          h(InlineStyle),
          h('header', { className: 'fh-header' },
            h('div', { className: 'fh-heading' },
              h('div', { className: 'fh-eyebrow' }, t('eyebrow')),
              h('h1', { className: 'fh-title' }, t('title')),
              h('p', { className: 'fh-subtitle' }, t('subtitle')),
            ),
          ),
          h(EmptyState, { icon: 'file', title: t('errorTitle'), text: t('errorHint') }),
          h('div', { className: 'fh-inline-error' },
            h('span', {}, sessionsState.error ?? t('errorHint')),
            h('button', { type: 'button', className: 'fh-btn', onClick: refresh }, t('retry')),
          ),
        )
      }

      let content
      if (searching) {
        const data = searchState.data
        content = h('div', { className: `fh-content ${selectedFile ? 'is-detail' : ''}` },
          h('div', { className: 'fh-list-pane' },
            h('div', { className: 'fh-pane-head' },
              h('div', {},
                h('h2', { className: 'fh-pane-title' }, t('searchResults')),
                h('p', { className: 'fh-pane-sub' },
                  data
                    ? `${t('searchPageSummary', { page: searchPage, pages: searchPageCount, total: data.totalMatched ?? data.total ?? 0 })} · ${t('searchFrom', { count: data.sessions?.length ?? 0 })}`
                    : '',
                ),
              ),
            ),
            searchState.status === 'loading' ? h(Skeleton, { rows: 4 }) : null,
            searchState.status === 'error' ? h('div', { className: 'fh-inline-error' }, h('span', {}, searchState.error ?? t('errorHint')), h('button', { type: 'button', className: 'fh-btn', onClick: refresh }, t('retry'))) : null,
            searchState.status === 'ready' && data?.results?.length === 0 ? h(EmptyState, { icon: 'search', title: t('searchNoResultsTitle'), text: t('searchNoResultsHint') }) : null,
            searchState.status === 'ready' && data?.results?.length > 0 ? h('div', { className: 'fh-list', key: `search-${searchPage}` },
              data.results.map((file) => h(FileRow, {
                key: file.id,
                file,
                selected: file.id === selectedId,
                showSession: true,
                tokens: searchTokens,
                onSelect: selectFile,
                t,
              })),
            ) : null,
            searchState.status === 'ready' && data?.results?.length > 0 ? h(Pagination, {
              page: searchPage,
              pageCount: searchPageCount,
              onChange: setSearchPage,
              t,
            }) : null,
          ),
          selectedFile ? h(FileDetail, {
            t,
            file: selectedFile,
            detail: detailState.data,
            detailState,
            onClose: () => setSelectedId(null),
            onCopyRef: copyReference,
            onCopyPrompt: copyPrompt,
            onOpenFolder: openFolder,
            openingFolder,
            onSelectOccurrence: selectOccurrence,
          }) : null,
        )
      } else {
        const data = filesState.data
        content = h('div', { className: `fh-content ${selectedFile ? 'is-detail' : ''}` },
          h('div', { className: 'fh-list-pane' },
            h('div', { className: 'fh-pane-head' },
              h('div', {},
                h('h2', { className: 'fh-pane-title' }, selectedSession ? (selectedSession.title !== selectedSession.id ? selectedSession.title : t('untitled')) : t('conversations')),
                h('p', { className: 'fh-pane-sub' },
                  selectedSession
                    ? data
                      ? `${t('filesPageSummary', { page: filePage, pages: filePageCount, total: data.totalFiles ?? selectedSession.fileCount })} · ${t('updated')} ${formatTime(selectedSession.updatedAt)}`
                      : `${t('filesCount', { count: selectedSession.fileCount })} · ${t('updated')} ${formatTime(selectedSession.updatedAt)}`
                    : '',
                ),
              ),
            ),
            filesState.status === 'loading' ? h(Skeleton, { rows: 4 }) : null,
            filesState.status === 'error' ? h('div', { className: 'fh-inline-error' }, h('span', {}, filesState.error ?? t('errorHint')), h('button', { type: 'button', className: 'fh-btn', onClick: refresh }, t('retry'))) : null,
            filesState.status === 'ready' && data?.files?.length === 0 ? h(EmptyState, { icon: 'file', title: t('noFilesTitle'), text: t('noFilesHint') }) : null,
            filesState.status === 'ready' && data?.files?.length > 0 ? h('div', { className: 'fh-list', key: `files-${filePage}` },
              data.files.map((file) => h(FileRow, {
                key: file.id,
                file,
                selected: file.id === selectedId,
                showSession: false,
                tokens: [],
                onSelect: selectFile,
                t,
              })),
            ) : null,
            filesState.status === 'ready' && data?.files?.length > 0 ? h(Pagination, {
              page: filePage,
              pageCount: filePageCount,
              onChange: setFilePage,
              t,
            }) : null,
          ),
          selectedFile ? h(FileDetail, {
            t,
            file: selectedFile,
            detail: detailState.data,
            detailState,
            onClose: () => setSelectedId(null),
            onCopyRef: copyReference,
            onCopyPrompt: copyPrompt,
            onOpenFolder: openFolder,
            openingFolder,
            onSelectOccurrence: selectOccurrence,
          }) : null,
        )
      }

      return h('div', { className: 'fh-root' },
        h(InlineStyle),
        h('header', { className: 'fh-header' },
          h('div', { className: 'fh-heading' },
            h('div', { className: 'fh-eyebrow' }, t('eyebrow')),
            h('h1', { className: 'fh-title' }, t('title')),
            h('p', { className: 'fh-subtitle' }, t('subtitle')),
          ),
          h('div', { className: 'fh-header-actions' },
            h(StatusPill, { t, stats }),
            h('button', { type: 'button', className: 'fh-btn', onClick: refresh },
              h('span', { className: sessionsState.status === 'refreshing' ? 'fh-spin' : '' }, h(Icon, { name: 'refresh', size: 13 })),
              t('refresh'),
            ),
          ),
        ),
        h('div', { className: 'fh-searchbar' },
          h(Icon, { name: 'search', size: 16 }),
          h('input', {
            className: 'fh-search-input',
            value: query,
            onChange: (event) => {
              setQuery(event.target.value)
              setSearchPage(1)
            },
            placeholder: t('searchPlaceholder'),
            'aria-label': t('searchPlaceholder'),
            spellCheck: false,
          }),
          query.length > 0 ? h('button', { type: 'button', className: 'fh-icon-btn', onClick: () => { setQuery(''); setSearchPage(1); setFilePage(1) }, title: t('clearSearch'), 'aria-label': t('clearSearch') }, h(Icon, { name: 'close', size: 13 })) : h('span', { className: 'fh-search-note' }, t('searchHint')),
        ),
        h('div', { className: 'fh-summary' },
          h('span', {}, t('conversationsCount', { count: stats?.sessions ?? sessions.length })),
          h('span', { className: 'fh-summary-sep' }, '·'),
          h('span', {}, t('filesCount', { count: stats?.files ?? 0 })),
          h('span', { className: 'fh-summary-sep' }, '·'),
          h('span', {}, t('indexedChars', { count: stats?.indexedChars ?? 0 })),
          stats?.truncated?.sessions || stats?.truncated?.files || stats?.truncated?.text ? h('span', { className: 'fh-warning' }, t('indexPartial')) : null,
          stats?.failedSessions ? h('span', { className: 'fh-warning' }, t('partialWarning', { count: stats.failedSessions })) : null,
          h('span', { className: 'fh-summary-safety' }, t('safety')),
        ),
        hasSessions ? h('div', { className: 'fh-body' },
          h('aside', { className: 'fh-sessions', 'aria-label': t('conversations') },
            h('div', { className: 'fh-sessions-head' },
              h('span', {}, t('conversations')),
              h('span', {}, sessions.length),
            ),
            h('div', { className: 'fh-sessions-list' },
              sessions.map((session) => h(SessionRow, {
                key: session.id,
                session,
                selected: session.id === selectedSessionId,
                onSelect: (id) => {
                  setQuery('')
                  setSearchPage(1)
                  setFilePage(1)
                  setSelectedSessionId(id)
                },
                t,
              })),
            ),
          ),
          content,
        ) : h(EmptyState, { icon: 'folder', title: t('noSessionsTitle'), text: t('noSessionsHint') }),
        toast ? h('div', {
          className: `fh-toast ${toast.error ? 'is-error' : ''}`,
          role: 'status',
          'aria-live': 'polite',
        }, h('span', { className: 'fh-toast-dot' }), toast.message) : null,
      )
    }

    function FileHubIcon({ size = 18, active = false }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { color: active ? 'var(--dsw-alias-brand-primary)' : 'currentColor' },
      },
        h('path', {
          d: 'M3.8 7.2A1.8 1.8 0 0 1 5.6 5.4h4.1l1.9 2h6.8a1.8 1.8 0 0 1 1.8 1.8v7.4a1.8 1.8 0 0 1-1.8 1.8H5.6a1.8 1.8 0 0 1-1.8-1.8V7.2Z',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinejoin: 'round',
        }),
        h('path', { d: 'M9.2 12.2h6.1M9.2 15h4.1', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('circle', { cx: 17.8, cy: 6.2, r: 2.2, fill: 'var(--dsw-alias-brand-primary)', opacity: 0.9 }),
      )
    }

    async function fetchJson(path, signal) {
      const response = await fetch(path, {
        signal,
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      let payload
      try {
        payload = await response.json()
      } catch {
        payload = undefined
      }
      if (!response.ok || !payload || payload.ok !== true) {
        const message = payload && typeof payload.error === 'string' ? payload.error : `HTTP ${response.status}`
        throw new Error(message)
      }
      return payload
    }

    async function postJson(path, value) {
      const response = await fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(value),
      })
      let payload
      try {
        payload = await response.json()
      } catch {
        payload = undefined
      }
      if (!response.ok || !payload || payload.ok !== true) {
        const message = payload && typeof payload.error === 'string' ? payload.error : `HTTP ${response.status}`
        throw new Error(message)
      }
      return payload
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'file-hub: dictionaries')
      if (!INLINE_STYLE) {
        ctx.effect(() => styles.insert(CSS), 'file-hub: styles')
      }
      const t = ctx.locale.bind(NS)

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, FileHubPanel))

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: () => t('panel'),
      }, FileHubIcon))
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
