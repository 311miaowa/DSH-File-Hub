# Security Policy

## Supported versions

Security fixes are applied to the current `1.x` line.

## Reporting a vulnerability

Please do not open a public issue for a vulnerability that could expose local
files, session logs, authentication material, or arbitrary native execution.
Use the repository's **Security → Report a vulnerability** flow, or contact the
maintainer privately.

Include the affected version, a minimal reproduction, the impact, and any
suggested fix. Please allow time for a fix before public disclosure.

## Security model

DSH File Hub is a local, read-only file index with one explicit user action
that opens a file's containing folder.

- The Session log is the source of truth; the plugin does not create Session
  events or write a separate index.
- Query routes are `GET` and use Harness Connection's browser authentication
  and Host/Origin checks.
- The only `POST` route, `/api/filehub.folder`, accepts an opaque `fh_...`
  reference, revalidates the path against the Session workspace, rejects
  symbolic links, and launches a file manager with argv rather than a shell.
- The browser and the agent never submit arbitrary absolute paths.
- Global search spans sessions by design. Search results and cited session
  excerpts may contain secrets or prompt-injection text; treat file and log
  content as untrusted data.

## Out of scope

- A compromised local account, malicious plugins in the same Harness profile,
  or a compromised DSH installation.
- Files changed by another process after indexing; the UI reports its best
  available source comparison but cannot freeze the filesystem.
- Operating-system policy that prevents a GUI file manager from opening, such
  as a non-interactive Windows session or an elevation boundary.
- The security of third-party applications that receive a file after the user
  opens or drags it.
