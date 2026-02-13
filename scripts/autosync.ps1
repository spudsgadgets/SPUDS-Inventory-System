param(
  [int]$IntervalSeconds = 60
)

$ErrorActionPreference = 'Stop'

function GetGitDir {
  git rev-parse --git-dir
}

function HasUpstream {
  try {
    $u = git rev-parse --abbrev-ref --symbolic-full-name '@{u}'
    if ($LASTEXITCODE -eq 0 -and $u) { return $true } else { return $false }
  } catch { return $false }
}

function GetAheadBehind {
  $out = git rev-list --left-right --count "HEAD...@{u}"
  if (-not $out) { return @{ahead=0;behind=0} }
  $parts = $out.Trim().Split(' ')
  if ($parts.Count -ge 2) { return @{ahead=[int]$parts[0];behind=[int]$parts[1]} } else { return @{ahead=0;behind=0} }
}

function RebaseInProgress {
  $gitDir = GetGitDir
  return ((Test-Path (Join-Path $gitDir 'rebase-merge')) -or (Test-Path (Join-Path $gitDir 'rebase-apply')))
}

while ($true) {
  try {
    git fetch --quiet
    if (RebaseInProgress) {
      Write-Host "Auto-sync: rebase in progress; waiting"
    } elseif (HasUpstream) {
      $ab = GetAheadBehind
      if ($ab.behind -gt 0) {
        try {
          git pull --rebase --autostash | Out-Null
          Write-Host "Auto-sync: pulled $($ab.behind) upstream commits"
        } catch {
          Write-Host "Auto-sync: pull failed; resolve conflicts and continue"
        }
      }
      if ($ab.ahead -gt 0) {
        try {
          git push | Out-Null
          Write-Host "Auto-sync: pushed $($ab.ahead) local commits"
        } catch {
          Write-Host "Auto-sync: push failed"
        }
      }
    }
  } catch {
    Write-Host ("Auto-sync: " + $_.Exception.Message)
  }
  Start-Sleep -Seconds $IntervalSeconds
}
