param(
  [int]$Port = 5173,
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

function Get-ContentType([string]$Path) {
  switch -regex ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '\.html?$' { 'text/html; charset=utf-8' }
    '\.css$'   { 'text/css; charset=utf-8' }
    '\.js$'    { 'text/javascript; charset=utf-8' }
    '\.json$'  { 'application/json; charset=utf-8' }
    '\.svg$'   { 'image/svg+xml' }
    '\.png$'   { 'image/png' }
    '\.jpe?g$' { 'image/jpeg' }
    '\.webp$'  { 'image/webp' }
    '\.gif$'   { 'image/gif' }
    '\.ico$'   { 'image/x-icon' }
    '\.woff2$' { 'font/woff2' }
    '\.woff$'  { 'font/woff' }
    '\.ttf$'   { 'font/ttf' }
    default    { 'application/octet-stream' }
  }
}

$rootFull = (Resolve-Path -LiteralPath $Root).Path
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Serving $rootFull" -ForegroundColor Green
Write-Host "Open: $prefix" -ForegroundColor Cyan
Write-Host "(Ctrl+C to stop)" -ForegroundColor DarkGray

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()

    try {
      $reqPath = $ctx.Request.Url.AbsolutePath
      if ([string]::IsNullOrWhiteSpace($reqPath) -or $reqPath -eq '/') { $reqPath = '/index.html' }

      $decoded = [Uri]::UnescapeDataString($reqPath)
      $decoded = $decoded.TrimStart('/')
      $decoded = $decoded -replace '/', '\\'

      $candidate = Join-Path $rootFull $decoded
      $full = [IO.Path]::GetFullPath($candidate)

      if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
        $ctx.Response.StatusCode = 403
        $bytes = [Text.Encoding]::UTF8.GetBytes('403 Forbidden')
        $ctx.Response.ContentType = 'text/plain; charset=utf-8'
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $ctx.Response.OutputStream.Close()
        continue
      }

      if (Test-Path -LiteralPath $full -PathType Container) {
        $full = Join-Path $full 'index.html'
      }

      if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $ctx.Response.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $ctx.Response.ContentType = 'text/plain; charset=utf-8'
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $ctx.Response.OutputStream.Close()
        continue
      }

      $bytes = [IO.File]::ReadAllBytes($full)
      $ctx.Response.StatusCode = 200
      $ctx.Response.ContentType = (Get-ContentType $full)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $ctx.Response.OutputStream.Close()
    } catch {
      $ctx.Response.StatusCode = 500
      $bytes = [Text.Encoding]::UTF8.GetBytes('500 Server Error')
      $ctx.Response.ContentType = 'text/plain; charset=utf-8'
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $ctx.Response.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
