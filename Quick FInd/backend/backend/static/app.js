const API_BASE = window.location.origin === "null" ? "http://localhost:8000" : window.location.origin;

const state = {
  view: "knowledge",
  knowledgeBases: [],
  selectedKbId: localStorage.getItem("quickfind:selectedKb") || "",
  documents: [],
  config: {},
  chatHistories: {},
  directQuery: {
    question: "",
    answer: "",
    sources: [],
    chunks: [],
    selectedChunkIndex: null,
    loading: false,
  },
  selectedSource: null,
  preview: null,
  isChatting: false,
  isUploading: false,
  dragging: false,
  modal: null,
  modalKbId: null,
  toast: null,
};

const ICONS = {
  database: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  message: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>',
  question: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 5.1 2.1c-.9.8-1.7 1.3-1.9 2.9"/><circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none"/></svg>',
  upload: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  logout: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.4 18.4A5 5 0 0 0 18 9h-1.3A7 7 0 1 0 5 15.3"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
};

function icon(name) {
  return ICONS[name] || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(value, length = 92) {
  const text = readableText(value);
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

function readableText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function relativeTime(value) {
  if (!value) return "Indexed";
  const diff = Date.now() - new Date(value).getTime();
  const minute = 60 * 1000;
  if (diff < minute) return "Updated just now";
  if (diff < 60 * minute) return `Updated ${Math.floor(diff / minute)} mins ago`;
  if (diff < 24 * 60 * minute) return `Updated ${Math.floor(diff / (60 * minute))} hrs ago`;
  return new Date(value).toLocaleDateString();
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch (_) {
      message = await response.text();
    }
    throw new Error(message);
  }
  return response.json();
}

function showToast(message, type = "success") {
  state.toast = { message, type };
  renderToast();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = null;
    renderToast();
  }, 3800);
}

async function loadKnowledgeBases() {
  const payload = await fetchJson("/knowledge-bases");
  state.knowledgeBases = payload.knowledge_bases || [];
  if (!state.selectedKbId || !state.knowledgeBases.some((kb) => kb.id === state.selectedKbId)) {
    state.selectedKbId = state.knowledgeBases[0]?.id || "";
  }
  if (state.selectedKbId) {
    localStorage.setItem("quickfind:selectedKb", state.selectedKbId);
  }
}

async function loadDocuments() {
  if (!state.selectedKbId) {
    state.documents = [];
    return;
  }
  const payload = await fetchJson(`/knowledge-bases/${encodeURIComponent(state.selectedKbId)}/documents`);
  state.documents = payload.documents || [];
}

async function loadConfig() {
  const payload = await fetchJson("/config");
  state.config = payload.config || {};
}

function currentKb() {
  return state.knowledgeBases.find((kb) => kb.id === state.selectedKbId) || state.knowledgeBases[0] || null;
}

function modalKb() {
  return state.knowledgeBases.find((kb) => kb.id === state.modalKbId) || null;
}

function defaultChatMessages(kb = currentKb()) {
  const target = kb?.name ? ` "${kb.name}"` : "";
  return [
    {
      role: "assistant",
      content: `Hello. I'm ready to help you search through${target}. What would you like to know?`,
      sources: [],
    },
  ];
}

function currentMessages() {
  if (!state.selectedKbId) return defaultChatMessages(null);
  if (!state.chatHistories[state.selectedKbId]) {
    state.chatHistories[state.selectedKbId] = defaultChatMessages();
  }
  return state.chatHistories[state.selectedKbId];
}

function shell(content, options = {}) {
  const showPreview = state.view === "chat" && state.selectedSource;
  return `
    <div class="layout ${showPreview ? "with-preview" : ""}">
      ${renderSidebar()}
      <main class="main">${content}</main>
      ${showPreview ? renderPreviewPanel() : ""}
    </div>
    ${renderModal()}
  `;
}

function renderSidebar() {
  const items = [
    ["knowledge", "database", "Knowledge Bases", "Browse all bases"],
    ["chat", "message", "Chat", "Talk with AI"],
    ["query", "question", "Query", "Inspect chunks"],
    ["upload", "upload", "Upload Data", "Add new data"],
    ["config", "settings", "Configure", "System settings"],
  ];
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">${icon("database")}</div>
        <div class="brand-text">
          <div class="brand-name">QuickFind</div>
          <div class="brand-subtitle">Knowledge Management</div>
        </div>
      </div>
      <nav class="nav-section" aria-label="Main navigation">
        <p class="nav-label">Navigation</p>
        ${items
          .map(
            ([view, iconName, title, kicker]) => `
              <button class="nav-item ${state.view === view ? "active" : ""}" data-action="set-view" data-view="${view}" data-tooltip="Open ${title}.">
                <span class="nav-icon" aria-hidden="true">${icon(iconName)}</span>
                <span class="nav-text"><span class="nav-title">${title}</span><span class="nav-kicker">${kicker}</span></span>
              </button>
            `,
          )
          .join("")}
      </nav>
      <div class="sidebar-spacer"></div>
      <button class="sign-out" data-action="toast" data-message="Session controls are local in this demo." data-tooltip="Session controls are local in this demo.">
        ${icon("logout")} <span>Sign Out</span>
      </button>
    </aside>
  `;
}

function renderKnowledge() {
  return shell(`
    <section class="topbar flush">
      <div>
        <h1>Knowledge Bases</h1>
        <p class="page-copy">Manage your data sources. Create isolated environments to organize documents and context for specific queries.</p>
      </div>
    </section>
    <section class="content">
      <div class="kb-grid">
        <article class="kb-card create">
          <button class="create-button" data-action="open-create-kb" data-tooltip="Create a separate knowledge base for a new set of documents.">
            <span class="plus-bubble" aria-hidden="true">${icon("plus")}</span>
            <span class="create-title">Create New</span>
            <span class="create-subtitle">Set up a fresh data environment</span>
          </button>
        </article>
        ${state.knowledgeBases.map(renderKbCard).join("")}
      </div>
    </section>
  `);
}

function renderKbCard(kb) {
  const docCount = Number(kb.document_count || 0);
  const description = kb.description || "Primary workspace knowledge base";
  const canDelete = kb.id !== "kb-default";
  return `
    <article class="kb-card kb-card-action">
      <div class="kb-card-main" role="button" tabindex="0" data-action="open-kb-chat" data-kb-id="${escapeHtml(kb.id)}" aria-label="Open ${escapeHtml(kb.name)} chat">
        <div class="kb-card-head">
          <span class="card-icon" aria-hidden="true">${icon("file")}</span>
          <span class="status-pill ${docCount ? "success" : ""}">${docCount ? "Active" : "Empty"}</span>
        </div>
        <h2 class="kb-title">${escapeHtml(truncate(kb.name, 30))}</h2>
        <p class="kb-description">${escapeHtml(truncate(description, 112))}</p>
      </div>
      <div class="kb-footer">
        <span class="doc-count">${icon("file")} ${docCount} documents</span>
        <div class="kb-actions">
          <button class="secondary-button" data-action="open-kb-chat" data-kb-id="${escapeHtml(kb.id)}" data-tooltip="Open AI chat for this knowledge base.">Chat</button>
          <button class="secondary-button" data-action="open-kb-query" data-kb-id="${escapeHtml(kb.id)}" data-tooltip="Search and inspect retrieved chunks without AI.">Chunks</button>
          <button class="ghost-button compact-button" data-action="open-rename-kb" data-kb-id="${escapeHtml(kb.id)}" data-tooltip="Change this knowledge base name or description.">Rename</button>
          <button class="ghost-button compact-button danger-button" data-action="open-delete-kb" data-kb-id="${escapeHtml(kb.id)}" data-tooltip="${canDelete ? "Delete this knowledge base and its indexed chunks." : "The default knowledge base cannot be deleted."}" ${canDelete ? "" : "disabled"}>Delete</button>
        </div>
      </div>
    </article>
  `;
}

function renderChat() {
  const kb = currentKb();
  return shell(`
    <section class="chat-shell">
      <header class="topbar">
        <div>
          <h1>Chat</h1>
          <p class="page-copy">Ask questions and get AI answers from your documents.</p>
        </div>
        <select class="kb-select" data-action="select-kb" aria-label="Knowledge base">
          ${state.knowledgeBases
            .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === state.selectedKbId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
            .join("")}
        </select>
      </header>
      <div class="messages" id="messages">${renderMessages()}</div>
      <form class="composer" id="chat-form">
        <textarea id="chat-input" class="chat-input" rows="1" placeholder="${kb ? "Ask a question about your knowledge base..." : "Create a knowledge base first..."}" ${state.isChatting || !kb ? "disabled" : ""}></textarea>
        <button class="send-button" type="submit" aria-label="Send message" data-tooltip="Send your message. Press Enter to send." ${state.isChatting || !kb ? "disabled" : ""}>
          ${state.isChatting ? '<span class="spinner" aria-hidden="true"></span>' : icon("send")}
        </button>
      </form>
    </section>
  `);
}

function renderDirectQuery() {
  const kb = currentKb();
  const query = state.directQuery;
  return shell(`
    <section class="topbar">
      <div>
        <h1>Query</h1>
        <p class="page-copy">Search the vector index directly and inspect the retrieved chunks without AI generation.</p>
      </div>
      <select class="kb-select" data-action="select-kb" aria-label="Knowledge base">
        ${state.knowledgeBases
          .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === state.selectedKbId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
          .join("")}
      </select>
    </section>
    <section class="content query-workspace">
      <form class="query-panel" id="direct-query-form">
        <div class="field">
          <label for="direct-query-input">Retrieval Query</label>
          <textarea id="direct-query-input" name="question" placeholder="${kb ? "Search for source chunks..." : "Create a knowledge base first..."}" ${query.loading || !kb ? "disabled" : ""}>${escapeHtml(query.question)}</textarea>
        </div>
        <div class="form-actions">
          <button class="primary-button" type="submit" data-tooltip="Retrieve the top chunks from this knowledge base." ${query.loading || !kb ? "disabled" : ""}>
            ${query.loading ? '<span class="spinner" aria-hidden="true"></span>' : icon("question")} Search chunks
          </button>
          <button class="ghost-button" type="button" data-action="clear-direct-query" data-tooltip="Clear the current query and chunk results." ${query.loading ? "disabled" : ""}>Clear</button>
        </div>
      </form>
      ${renderDirectQueryResults()}
    </section>
  `);
}

function renderDirectQueryResults() {
  const query = state.directQuery;
  if (query.loading) {
    return `<div class="empty-state"><p class="empty-copy">Searching the vector index...</p></div>`;
  }
  if (!query.sources.length) {
    return renderEmpty("Run a query to see the four most relevant chunks.");
  }
  return `
    <section class="chunk-list">
      <p class="source-label">Retrieved Chunks</p>
      ${query.sources.map((source, index) => renderQuerySourceCard(source, index)).join("")}
    </section>
    ${renderInlineDocumentViewer()}
  `;
}

function renderMessages() {
  return currentMessages()
    .map((message, index) => {
      const sources = message.sources || message.citations || [];
      return `
        <article class="bubble ${message.role} ${message.loading ? "pending" : ""}">
          <div class="bubble-text">${escapeHtml(message.content || (message.loading ? "Searching the knowledge base..." : ""))}</div>
          ${
            message.role === "assistant" && sources.length
              ? `<div class="sources-block">
                  <p class="source-label">Referenced Documents</p>
                  <div class="source-list">
                    ${sources.map((source, sourceIndex) => renderSourceCard(source, index, sourceIndex)).join("")}
                  </div>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function renderSourceCard(source, messageIndex, sourceIndex) {
  const id = source.id || source.chunk_id || "";
  const title = source.source || source.label || `Source ${sourceIndex + 1}`;
  const active = state.selectedSource && (state.selectedSource.id || state.selectedSource.chunk_id) === id;
  return `
    <button class="source-card ${active ? "active" : ""}" data-action="open-source" data-message-index="${messageIndex}" data-source-index="${sourceIndex}">
      <span class="source-icon" aria-hidden="true">${icon("file")}</span>
      <span>
        <p class="source-title">${escapeHtml(truncate(title, 64))}</p>
        <p class="source-snippet">${escapeHtml(truncate(source.snippet || source.label || "Open document preview", 116))}</p>
      </span>
    </button>
  `;
}

function renderQuerySourceCard(source, sourceIndex) {
  const distance = source.distance === undefined || source.distance === null ? "" : `Distance ${Number(source.distance).toFixed(3)}`;
  const chunk = source.chunk_index === undefined || source.chunk_index === null ? "" : `Chunk ${source.chunk_index}`;
  const preview = state.directQuery.chunks[sourceIndex];
  const content = readableText(preview?.content || source.snippet || "Chunk preview unavailable.");
  const isSelected = state.directQuery.selectedChunkIndex === sourceIndex;
  return `
    <article class="query-chunk-card ${isSelected ? "selected" : ""}" role="button" tabindex="0" data-action="open-document-chunk" data-source-index="${sourceIndex}" data-tooltip="Open the source document around this chunk.">
      <header class="query-chunk-head">
        <span class="source-icon" aria-hidden="true">${icon("file")}</span>
        <div>
          <h2 class="query-chunk-title">${escapeHtml(source.source || source.label || `Source ${sourceIndex + 1}`)}</h2>
          <span class="chunk-meta">${escapeHtml([chunk, distance].filter(Boolean).join(" | "))}</span>
        </div>
      </header>
      <p class="query-chunk-body">${escapeHtml(content)}</p>
      <span class="chunk-open-hint">Open in document viewer</span>
    </article>
  `;
}

function renderInlineDocumentViewer() {
  const index = state.directQuery.selectedChunkIndex;
  if (index === null || index === undefined) return "";

  const source = state.directQuery.sources[index];
  const preview = state.directQuery.chunks[index];
  if (!source) return "";

  const content = readableText(preview?.content || source.snippet || "");
  const fileType = String(preview?.file_type || source.file_type || source.source?.split(".").pop() || "").toLowerCase();
  const sourceName = source.source || source.label || "Source document";
  const page = extractPageNumber(content);
  const searchText = makePdfSearchText(content);
  const fileUrl = buildSourceFileUrl(sourceName, fileType, page, searchText);
  const isPdf = fileType === "pdf" || sourceName.toLowerCase().endsWith(".pdf");

  return `
    <section class="document-viewer" id="document-viewer">
      <header class="document-viewer-head">
        <div>
          <p class="source-label">Document Viewer</p>
          <h2>${escapeHtml(sourceName)}</h2>
          <p class="doc-subtitle">${escapeHtml([page ? `Page ${page}` : "", searchText ? `Searching: ${truncate(searchText, 90)}` : ""].filter(Boolean).join(" | "))}</p>
        </div>
        <a class="ghost-button" href="${fileUrl}" target="_blank" rel="noopener" data-tooltip="Open the source file in a new browser tab.">Open File</a>
      </header>
      <div class="highlighted-chunk">
        <p class="source-label">Highlighted Retrieved Chunk</p>
        <p>${escapeHtml(content || "Chunk text unavailable.")}</p>
      </div>
      ${
        isPdf
          ? `<iframe class="file-frame" title="PDF preview for ${escapeHtml(sourceName)}" src="${fileUrl}"></iframe>`
          : `<iframe class="file-frame" title="File preview for ${escapeHtml(sourceName)}" src="${fileUrl}"></iframe>`
      }
    </section>
  `;
}

function buildSourceFileUrl(sourceName, fileType, page, searchText) {
  const params = new URLSearchParams({
    kb_id: state.selectedKbId,
    source: sourceName,
  });
  const base = `/documents/source?${params.toString()}`;
  const isPdf = fileType === "pdf" || sourceName.toLowerCase().endsWith(".pdf");
  if (!isPdf) return base;

  const hash = [];
  if (page) hash.push(`page=${page}`);
  if (searchText) hash.push(`search=${encodeURIComponent(searchText)}`);
  return hash.length ? `${base}#${hash.join("&")}` : base;
}

function extractPageNumber(text) {
  const match = String(text || "").match(/\bPage\s+(\d{1,4})\b/i);
  return match ? Number(match[1]) : null;
}

function makePdfSearchText(text) {
  const cleaned = readableText(text).replace(/^Page\s+\d+\s*/i, "");
  if (!cleaned) return "";
  const sentence = cleaned.split(/(?<=[.!?])\s+/)[0] || cleaned;
  return sentence.slice(0, 120).trim();
}

function renderPreviewPanel() {
  const source = state.selectedSource || {};
  return `
    <aside class="preview-panel" aria-label="Document preview">
      <header class="preview-head">
        <h2>Document Preview</h2>
        <button class="icon-button" data-action="close-preview" aria-label="Close preview" data-tooltip="Close the document preview.">${icon("close")}</button>
      </header>
      <div class="preview-body">
        <div class="info-box">
          <span aria-hidden="true">${icon("file")}</span>
          <div>
            <strong>${escapeHtml(source.source || source.label || "Document Source")}</strong>
            <p class="doc-subtitle">${escapeHtml(source.label || "Relevant retrieved content")}</p>
          </div>
        </div>
        <div class="preview-content">
          ${renderPreviewContent()}
        </div>
      </div>
    </aside>
  `;
}

function renderPreviewContent() {
  if (state.preview?.neighbors?.length) {
    return state.preview.neighbors
      .map(
        (chunk) => `
          <section class="preview-chunk ${chunk.is_target ? "target" : ""}">
            <p class="meta">Chunk ${escapeHtml(chunk.chunk_index)}</p>
            <div>${escapeHtml(readableText(chunk.content))}</div>
          </section>
        `,
      )
      .join("");
  }
  if (state.preview?.content) {
    return `<section class="preview-chunk target"><div>${escapeHtml(readableText(state.preview.content))}</div></section>`;
  }
  return `<section class="preview-chunk target"><div>${escapeHtml(readableText(state.selectedSource?.snippet || "Select a referenced document to preview its retrieved text."))}</div></section>`;
}

function renderUpload() {
  return shell(`
    <section class="upload-page">
      <header class="topbar">
        <div>
          <h1>Upload to Knowledge Base</h1>
          <p class="page-copy">Add documents to your active base for querying.</p>
        </div>
        <select class="kb-select" data-action="select-kb" aria-label="Knowledge base">
          ${state.knowledgeBases
            .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === state.selectedKbId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
            .join("")}
        </select>
      </header>
      <section class="content">
        <div class="drop-zone ${state.dragging ? "dragging" : ""}" id="drop-zone">
          <div>
            <div class="drop-icon" aria-hidden="true">${icon("cloud")}</div>
            <h2>Drag & Drop files here</h2>
            <p>PDF, TXT, MD, XML, XLSX, and XLS up to your server limit.</p>
            <div class="upload-actions">
              <input id="file-input" class="hidden-input" type="file" multiple accept=".pdf,.txt,.md,.markdown,.xml,.xlsx,.xls" />
              <button class="primary-button" data-action="select-files" data-tooltip="Choose files to upload and index." ${state.isUploading || !state.selectedKbId ? "disabled" : ""}>${icon("plus")} Select Files</button>
            </div>
          </div>
        </div>
        <div class="recent-head">
          <h2>Recent Uploads</h2>
          <span class="count-pill">${state.documents.length} Files</span>
        </div>
        <div class="doc-list">
          ${state.documents.length ? state.documents.map(renderDocRow).join("") : renderEmpty("No indexed files in this knowledge base yet.")}
        </div>
      </section>
    </section>
  `);
}

function renderDocRow(doc) {
  return `
    <article class="doc-row">
      <span class="source-icon" aria-hidden="true">${icon("file")}</span>
      <div>
        <p class="doc-title">${escapeHtml(doc.name)}</p>
        <p class="meta">${formatBytes(doc.size)} &bull; ${relativeTime(doc.modified_at)} &bull; ${doc.chunk_count || 0} chunks</p>
      </div>
      <span class="status-pill success">Processed</span>
    </article>
  `;
}

function renderConfig() {
  const config = state.config || {};
  return shell(`
    <section class="topbar">
      <div>
        <h1>Configure</h1>
        <p class="page-copy">Tune model, retrieval, and chunking settings for the local RAG pipeline.</p>
      </div>
    </section>
    <section class="content">
      <form id="config-form">
        <div class="config-grid">
          ${field("model", "Model", config.model || "")}
          ${field("embedding_model", "Embedding Model", config.embedding_model || "")}
          ${field("temperature", "Temperature", config.temperature ?? 0.2, "number", "0.1", "0", "2")}
          ${field("top_k", "Top K", config.top_k ?? 4, "number", "1", "1", "25")}
          ${field("chunk_size", "Chunk Size", config.chunk_size ?? 500, "number", "50", "50", "8000")}
          ${field("chunk_overlap", "Chunk Overlap", config.chunk_overlap ?? 50, "number", "10", "0", "4000")}
        </div>
        <div class="form-actions">
          <button class="primary-button" type="submit" data-tooltip="Save these model and retrieval settings.">Save Settings</button>
          <button class="ghost-button" type="button" data-action="reload-config" data-tooltip="Reload saved settings and discard unsaved edits.">Reload</button>
        </div>
      </form>
    </section>
  `);
}

function field(name, label, value, type = "text", step = "", min = "", max = "") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${step ? `step="${step}"` : ""} ${min ? `min="${min}"` : ""} ${max ? `max="${max}"` : ""} />
    </div>
  `;
}

function renderEmpty(copy) {
  return `<div class="empty-state"><p class="empty-copy">${escapeHtml(copy)}</p></div>`;
}

function renderModal() {
  if (state.modal === "rename-kb") {
    const kb = modalKb();
    if (!kb) return "";
    return `
      <div class="modal-backdrop">
        <form class="modal" id="rename-kb-form">
          <div class="modal-head">
            <h2>Rename Knowledge Base</h2>
            <button class="icon-button" type="button" data-action="close-modal" aria-label="Close" data-tooltip="Close this dialog.">${icon("close")}</button>
          </div>
          <div class="field">
            <label for="rename-kb-name">Name</label>
            <input id="rename-kb-name" name="name" required maxlength="80" value="${escapeHtml(kb.name)}" />
          </div>
          <div class="field" style="margin-top:16px">
            <label for="rename-kb-description">Description</label>
            <textarea id="rename-kb-description" name="description" maxlength="240">${escapeHtml(kb.description || "")}</textarea>
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit" data-tooltip="Save the new name and description.">Save</button>
            <button class="ghost-button" type="button" data-action="close-modal" data-tooltip="Close without saving changes.">Cancel</button>
          </div>
        </form>
      </div>
    `;
  }

  if (state.modal === "delete-kb") {
    const kb = modalKb();
    if (!kb) return "";
    return `
      <div class="modal-backdrop">
        <form class="modal" id="delete-kb-form">
          <div class="modal-head">
            <h2>Delete Knowledge Base</h2>
            <button class="icon-button" type="button" data-action="close-modal" aria-label="Close" data-tooltip="Close this dialog.">${icon("close")}</button>
          </div>
          <p class="modal-copy">Delete "${escapeHtml(kb.name)}" and remove its indexed chunks. This cannot be undone.</p>
          <div class="form-actions">
            <button class="primary-button destructive-button" type="submit" data-tooltip="Permanently delete this knowledge base.">Delete</button>
            <button class="ghost-button" type="button" data-action="close-modal" data-tooltip="Keep this knowledge base.">Cancel</button>
          </div>
        </form>
      </div>
    `;
  }

  if (state.modal !== "create-kb") return "";
  return `
    <div class="modal-backdrop">
      <form class="modal" id="create-kb-form">
        <div class="modal-head">
          <h2>Create Knowledge Base</h2>
          <button class="icon-button" type="button" data-action="close-modal" aria-label="Close" data-tooltip="Close this dialog.">${icon("close")}</button>
        </div>
        <div class="field">
          <label for="kb-name">Name</label>
          <input id="kb-name" name="name" required maxlength="80" />
        </div>
        <div class="field" style="margin-top:16px">
          <label for="kb-description">Description</label>
          <textarea id="kb-description" name="description" maxlength="240"></textarea>
        </div>
        <div class="form-actions">
          <button class="primary-button" type="submit" data-tooltip="Create this knowledge base.">Create</button>
          <button class="ghost-button" type="button" data-action="close-modal" data-tooltip="Close without creating.">Cancel</button>
        </div>
      </form>
    </div>
  `;
}

function renderToast() {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  if (!state.toast) return;
  const node = document.createElement("div");
  node.className = `toast ${state.toast.type === "error" ? "error" : ""}`;
  node.textContent = state.toast.message;
  document.body.appendChild(node);
}

function render() {
  const app = document.getElementById("app");
  const views = {
    knowledge: renderKnowledge,
    chat: renderChat,
    query: renderDirectQuery,
    upload: renderUpload,
    config: renderConfig,
  };
  app.innerHTML = (views[state.view] || renderKnowledge)();
  renderToast();
  if (state.view === "chat") {
    scrollMessages();
    setupChatInput();
  }
  if (state.view === "query") setupDirectQueryInput();
}

function scrollMessages() {
  requestAnimationFrame(() => {
    const messages = document.getElementById("messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  });
}

function setupChatInput() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.getElementById("chat-form")?.requestSubmit();
    }
  });
}

function setupDirectQueryInput() {
  const input = document.getElementById("direct-query-input");
  if (!input) return;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.getElementById("direct-query-form")?.requestSubmit();
    }
  });
}

async function setSelectedKb(kbId) {
  state.selectedKbId = kbId;
  localStorage.setItem("quickfind:selectedKb", kbId);
  state.selectedSource = null;
  state.preview = null;
  if (state.view === "query") {
    state.directQuery = { question: "", answer: "", sources: [], chunks: [], selectedChunkIndex: null, loading: false };
  }
  await loadDocuments();
  render();
}

async function sendMessage(text) {
  const question = text.trim();
  if (!question || state.isChatting || !state.selectedKbId) return;

  const activeKbId = state.selectedKbId;
  const messages = currentMessages();
  const history = messages
    .filter((message) => !message.loading && message.content)
    .slice(-10)
    .map(({ role, content }) => ({ role, content }));

  messages.push({ role: "user", content: question });
  const assistant = { role: "assistant", content: "", sources: [], loading: true };
  messages.push(assistant);
  state.isChatting = true;
  state.selectedSource = null;
  state.preview = null;
  render();

  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: question, kb_id: state.selectedKbId, use_llm: true, history }),
    });
    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || `${response.status} ${response.statusText}`);
    }
    await consumeStream(response, assistant, activeKbId);
    if (!assistant.content.trim()) assistant.content = "No answer generated.";
  } catch (error) {
    const fallback = await retrieveWithoutLlm(question, history).catch(() => null);
    if (fallback) {
      assistant.content = `The configured chat model could not answer, so I returned retrieval results instead.\n\n${fallback.answer}`;
      assistant.sources = fallback.citations || fallback.sources || [];
      showToast("Chat model failed; showing retrieved sources.", "error");
    } else {
      assistant.content = `I could not complete that query: ${error.message}`;
      assistant.sources = [];
      showToast(error.message, "error");
    }
  } finally {
    assistant.loading = false;
    state.isChatting = false;
    render();
  }
}

async function runDirectQuery(text) {
  const question = text.trim();
  if (!question || state.directQuery.loading || !state.selectedKbId) return;

  state.directQuery = {
    question,
    answer: "",
    sources: [],
    chunks: [],
    selectedChunkIndex: null,
    loading: true,
  };
  state.selectedSource = null;
  state.preview = null;
  render();

  try {
    const payload = await retrieveWithoutLlm(question, []);
    const sources = (payload.sources || payload.citations || []).slice(0, 4);
    const chunks = await loadQueryChunks(sources);
    state.directQuery = {
      question,
      answer: payload.answer || "",
      sources,
      chunks,
      selectedChunkIndex: null,
      loading: false,
    };
  } catch (error) {
    state.directQuery = {
      question,
      answer: "",
      sources: [],
      chunks: [],
      selectedChunkIndex: null,
      loading: false,
    };
    showToast(error.message, "error");
  }
  render();
}

async function loadQueryChunks(sources) {
  return Promise.all(
    sources.map(async (source) => {
      const chunkId = source.id || source.chunk_id;
      if (!chunkId) return null;
      try {
        return await fetchJson(`/preview/chunk/${encodeURIComponent(chunkId)}?kb_id=${encodeURIComponent(state.selectedKbId)}&neighbor_window=0`);
      } catch (_) {
        return null;
      }
    }),
  );
}

async function retrieveWithoutLlm(question, history) {
  return fetchJson("/chat/turn", {
    method: "POST",
    body: JSON.stringify({ q: question, kb_id: state.selectedKbId, use_llm: false, history }),
  });
}

async function consumeStream(response, assistant, kbId) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      const line = event.split("\n").find((part) => part.startsWith("data:"));
      if (!line) continue;
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.type === "meta") {
        assistant.sources = payload.citations || payload.sources || [];
      }
      if (payload.type === "delta") {
        assistant.content += payload.text || "";
        scheduleAssistantUpdate(assistant, kbId);
      }
      if (payload.type === "error") {
        throw new Error(payload.message || "Streaming query failed.");
      }
    }
  }
}

let streamFrame = null;

function scheduleAssistantUpdate(assistant, kbId) {
  if (streamFrame !== null) return;
  streamFrame = requestAnimationFrame(() => {
    streamFrame = null;
    updateLastAssistant(assistant, kbId);
  });
}

function updateLastAssistant(assistant, kbId) {
  if (kbId && kbId !== state.selectedKbId) return;
  const messages = document.getElementById("messages");
  if (!messages) return;
  const bubbles = messages.querySelectorAll(".bubble.assistant");
  const bubble = bubbles[bubbles.length - 1];
  if (!bubble) return;
  bubble.innerHTML = `
    <div class="bubble-text">${escapeHtml(assistant.content || "Searching the knowledge base...")}</div>
    ${
      assistant.sources?.length
        ? `<div class="sources-block">
            <p class="source-label">Referenced Documents</p>
            <div class="source-list">
              ${assistant.sources.map((source, index) => renderSourceCard(source, currentMessages().length - 1, index)).join("")}
            </div>
          </div>`
        : ""
    }
  `;
  scrollMessages();
}

async function openSource(messageIndex, sourceIndex) {
  const source = currentMessages()[messageIndex]?.sources?.[sourceIndex];
  if (!source) return;
  state.selectedSource = source;
  state.preview = null;
  render();

  const chunkId = source.id || source.chunk_id;
  if (!chunkId) return;
  try {
    state.preview = await fetchJson(`/preview/chunk/${encodeURIComponent(chunkId)}?kb_id=${encodeURIComponent(state.selectedKbId)}`);
  } catch (error) {
    state.preview = { content: source.snippet || error.message };
  }
  render();
}

async function uploadFiles(files) {
  const list = Array.from(files || []);
  if (!list.length || state.isUploading || !state.selectedKbId) return;
  state.isUploading = true;
  state.dragging = false;
  render();

  let uploaded = 0;
  for (const file of list) {
    const form = new FormData();
    form.append("file", file);
    form.append("kb_id", state.selectedKbId);
    try {
      const response = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || `${response.status} ${response.statusText}`);
      }
      uploaded += 1;
    } catch (error) {
      showToast(`${file.name}: ${error.message}`, "error");
    }
  }
  await loadKnowledgeBases();
  await loadDocuments();
  state.isUploading = false;
  render();
  if (uploaded) showToast(`${uploaded} file${uploaded === 1 ? "" : "s"} indexed.`);
}

async function createKnowledgeBase(form) {
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const description = String(data.get("description") || "").trim();
  if (!name) return;
  try {
    const payload = await fetchJson("/knowledge-bases", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    state.selectedKbId = payload.knowledge_base.id;
    localStorage.setItem("quickfind:selectedKb", state.selectedKbId);
    state.modal = null;
    state.modalKbId = null;
    await loadKnowledgeBases();
    await loadDocuments();
    render();
    showToast("Knowledge base created.");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function renameKnowledgeBase(form) {
  const kbId = state.modalKbId;
  if (!kbId) return;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const description = String(data.get("description") || "").trim();
  try {
    const payload = await fetchJson(`/knowledge-bases/${encodeURIComponent(kbId)}`, {
      method: "PATCH",
      body: JSON.stringify({ name, description }),
    });
    state.modal = null;
    state.modalKbId = null;
    await loadKnowledgeBases();
    if (payload.knowledge_base?.id === state.selectedKbId) {
      const history = state.chatHistories[state.selectedKbId];
      if (history?.length === 1 && history[0]?.role === "assistant") {
        state.chatHistories[state.selectedKbId] = defaultChatMessages(payload.knowledge_base);
      }
    }
    render();
    showToast("Knowledge base renamed.");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function deleteKnowledgeBase() {
  const kbId = state.modalKbId;
  if (!kbId) return;
  try {
    await fetchJson(`/knowledge-bases/${encodeURIComponent(kbId)}`, { method: "DELETE" });
    delete state.chatHistories[kbId];
    state.modal = null;
    state.modalKbId = null;
    await loadKnowledgeBases();
    if (state.selectedKbId === kbId) {
      state.selectedKbId = state.knowledgeBases[0]?.id || "";
      if (state.selectedKbId) localStorage.setItem("quickfind:selectedKb", state.selectedKbId);
      state.directQuery = { question: "", answer: "", sources: [], chunks: [], selectedChunkIndex: null, loading: false };
    }
    await loadDocuments();
    render();
    showToast("Knowledge base deleted.");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveConfig(form) {
  const data = new FormData(form);
  const payload = {
    model: String(data.get("model") || "").trim(),
    embedding_model: String(data.get("embedding_model") || "").trim(),
    temperature: Number(data.get("temperature")),
    top_k: Number(data.get("top_k")),
    chunk_size: Number(data.get("chunk_size")),
    chunk_overlap: Number(data.get("chunk_overlap")),
  };
  try {
    const result = await fetchJson("/config", { method: "POST", body: JSON.stringify(payload) });
    state.config = result.config;
    render();
    showToast("Settings saved.");
  } catch (error) {
    showToast(error.message, "error");
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "set-view") {
    state.view = target.dataset.view || "knowledge";
    state.selectedSource = null;
    state.preview = null;
    if (state.view === "upload") await loadDocuments();
    render();
  }
  if (action === "open-kb-chat") {
    await setSelectedKb(target.dataset.kbId);
    state.view = "chat";
    render();
  }
  if (action === "open-kb-query") {
    await setSelectedKb(target.dataset.kbId);
    state.view = "query";
    state.directQuery = { question: "", answer: "", sources: [], chunks: [], selectedChunkIndex: null, loading: false };
    render();
  }
  if (action === "open-create-kb") {
    state.modal = "create-kb";
    state.modalKbId = null;
    render();
    requestAnimationFrame(() => document.getElementById("kb-name")?.focus());
  }
  if (action === "open-rename-kb") {
    state.modal = "rename-kb";
    state.modalKbId = target.dataset.kbId;
    render();
    requestAnimationFrame(() => document.getElementById("rename-kb-name")?.focus());
  }
  if (action === "open-delete-kb") {
    if (target.disabled) return;
    state.modal = "delete-kb";
    state.modalKbId = target.dataset.kbId;
    render();
  }
  if (action === "close-modal") {
    state.modal = null;
    state.modalKbId = null;
    render();
  }
  if (action === "select-files") {
    event.preventDefault();
    document.getElementById("file-input")?.click();
  }
  if (action === "open-source") {
    await openSource(Number(target.dataset.messageIndex), Number(target.dataset.sourceIndex));
  }
  if (action === "close-preview") {
    state.selectedSource = null;
    state.preview = null;
    render();
  }
  if (action === "open-document-chunk") {
    state.directQuery.selectedChunkIndex = Number(target.dataset.sourceIndex);
    render();
    requestAnimationFrame(() => document.getElementById("document-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  if (action === "reload-config") {
    await loadConfig();
    render();
    showToast("Settings reloaded.");
  }
  if (action === "clear-direct-query") {
    state.directQuery = { question: "", answer: "", sources: [], chunks: [], selectedChunkIndex: null, loading: false };
    state.selectedSource = null;
    state.preview = null;
    render();
  }
  if (action === "toast") {
    showToast(target.dataset.message || "Done.");
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.matches("[data-action='select-kb']")) {
    await setSelectedKb(event.target.value);
  }
  if (event.target.id === "file-input") {
    await uploadFiles(event.target.files);
    event.target.value = "";
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "chat-form") {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const value = input?.value || "";
    if (input) input.value = "";
    await sendMessage(value);
  }
  if (event.target.id === "create-kb-form") {
    event.preventDefault();
    await createKnowledgeBase(event.target);
  }
  if (event.target.id === "rename-kb-form") {
    event.preventDefault();
    await renameKnowledgeBase(event.target);
  }
  if (event.target.id === "delete-kb-form") {
    event.preventDefault();
    await deleteKnowledgeBase();
  }
  if (event.target.id === "direct-query-form") {
    event.preventDefault();
    const input = document.getElementById("direct-query-input");
    await runDirectQuery(input?.value || "");
  }
  if (event.target.id === "config-form") {
    event.preventDefault();
    await saveConfig(event.target);
  }
});

document.addEventListener("keydown", async (event) => {
  const card = event.target.closest(".kb-card-main");
  if (!card || event.target !== card || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  await setSelectedKb(card.dataset.kbId);
  state.view = "chat";
  render();
});

document.addEventListener("keydown", (event) => {
  const card = event.target.closest(".query-chunk-card");
  if (!card || event.target !== card || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  state.directQuery.selectedChunkIndex = Number(card.dataset.sourceIndex);
  render();
  requestAnimationFrame(() => document.getElementById("document-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" }));
});

document.addEventListener("pointerover", (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  showTooltip(target);
});

document.addEventListener("pointerout", (event) => {
  if (!event.target.closest("[data-tooltip]")) return;
  hideTooltip();
});

document.addEventListener("focusin", (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  showTooltip(target);
});

document.addEventListener("focusout", (event) => {
  if (!event.target.closest("[data-tooltip]")) return;
  hideTooltip();
});

function showTooltip(target) {
  const text = target.dataset.tooltip;
  if (!text) return;

  let tooltip = document.getElementById("app-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "app-tooltip";
    tooltip.className = "app-tooltip";
    document.body.appendChild(tooltip);
  }

  tooltip.textContent = text;
  tooltip.classList.add("visible");

  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const top = Math.max(10, rect.top - tooltipRect.height - 10);
  const left = Math.min(
    window.innerWidth - tooltipRect.width - 10,
    Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2),
  );

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function hideTooltip() {
  const tooltip = document.getElementById("app-tooltip");
  if (tooltip) tooltip.classList.remove("visible");
}

document.addEventListener("dragover", (event) => {
  if (!event.target.closest("#drop-zone")) return;
  event.preventDefault();
  state.dragging = true;
  render();
});

document.addEventListener("dragleave", (event) => {
  if (!event.target.closest("#drop-zone")) return;
  state.dragging = false;
  render();
});

document.addEventListener("drop", async (event) => {
  if (!event.target.closest("#drop-zone")) return;
  event.preventDefault();
  await uploadFiles(event.dataTransfer.files);
});

async function init() {
  try {
    await Promise.all([loadKnowledgeBases(), loadConfig()]);
    await loadDocuments();
  } catch (error) {
    showToast(error.message, "error");
  }
  render();
}

init();
