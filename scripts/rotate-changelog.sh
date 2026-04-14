#!/usr/bin/env bash
set -euo pipefail

CHANGELOG="${1:-specs/memory-bank/CHANGELOG.yaml}"
ARCHIVE_DIR="${2:-specs/memory-bank/changelog-archive}"

TRIGGER_LINES="${TRIGGER_LINES:-600}"
TARGET_LINES="${TARGET_LINES:-200}"

if [[ ! -f "$CHANGELOG" ]]; then
  echo "ERROR: Changelog not found: $CHANGELOG" >&2
  exit 1
fi

mkdir -p "$ARCHIVE_DIR"

line_count() { wc -l < "$1" | tr -d ' '; }

ensure_archive_file() {
  local archive="$1"
  if [[ ! -f "$archive" ]]; then
    printf "entries:\n" > "$archive"
  else
    # Ensure it starts with "entries:" (very lightweight sanity check)
    if ! head -n 1 "$archive" | grep -q '^entries:'; then
      echo "ERROR: Archive file does not start with 'entries:': $archive" >&2
      exit 1
    fi
  fi
  # Ensure trailing newline
  tail -c 1 "$archive" | read -r _ || printf "\n" >> "$archive"
}

extract_entry_quarter() {
  local entry_file="$1"
  local date_line date y m q
  # Accept date: 2026-03-03 OR date: "2026-03-03" OR date: '2026-03-03'
  date_line="$(grep -m1 -E '^[[:space:]]*date:[[:space:]]*["'\'']?[0-9]{4}-[0-9]{2}-[0-9]{2}' "$entry_file" || true)"
  if [[ -z "$date_line" ]]; then
    echo "UNKNOWN"
    return
  fi
  date="$(echo "$date_line" | sed -E 's/^[[:space:]]*date:[[:space:]]*["'\'']?([0-9]{4}-[0-9]{2}-[0-9]{2}).*/\1/')"
  y="${date:0:4}"
  m="${date:5:2}"
  # Calculate quarter: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
  case "$m" in
    01|02|03) q="Q1" ;;
    04|05|06) q="Q2" ;;
    07|08|09) q="Q3" ;;
    10|11|12) q="Q4" ;;
    *) q="UNKNOWN" ;;
  esac
  echo "${y}-${q}"
}

get_next_archive_number() {
  local quarter="$1"
  local archive_num=1
  local archive_file
  
  while true; do
    archive_file="$ARCHIVE_DIR/changelog-archive-${quarter}-${archive_num}.yaml"
    if [[ ! -f "$archive_file" ]]; then
      echo "$archive_num"
      return
    fi
    ((archive_num++))
  done
}

# Only run rotation if over trigger
cur_lines="$(line_count "$CHANGELOG")"
if (( cur_lines <= TRIGGER_LINES )); then
  echo "OK: $CHANGELOG is $cur_lines lines (<= $TRIGGER_LINES). No rotation."
  exit 0
fi

echo "Rotate: $CHANGELOG is $cur_lines lines (> $TRIGGER_LINES). Target: < $TARGET_LINES lines."

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

while (( "$(line_count "$CHANGELOG")" >= TARGET_LINES )); do
  # Find all entry starts ("  - ") and take the last one (oldest entry, since newest-first file)
  mapfile -t starts < <(grep -n '^  - ' "$CHANGELOG" | cut -d: -f1 || true)
  if (( ${#starts[@]} == 0 )); then
    echo "ERROR: No entries found (expected lines starting with two spaces + dash)." >&2
    exit 1
  fi

  last_start="${starts[-1]}"
  entry_file="$tmp_dir/entry.yaml"

  # Extract last entry block (from last_start to EOF)
  tail -n +"$last_start" "$CHANGELOG" > "$entry_file"

  quarter="$(extract_entry_quarter "$entry_file")"
  if [[ "$quarter" == "UNKNOWN" ]]; then
    archive="$ARCHIVE_DIR/changelog-archive-unknown-dates.yaml"
  else
    archive_num="$(get_next_archive_number "$quarter")"
    archive="$ARCHIVE_DIR/changelog-archive-${quarter}-${archive_num}.yaml"
  fi

  ensure_archive_file "$archive"

  # Prepend entry to archive (maintain reverse chronological order)
  # Create temporary file with new entry first, then existing content
  cat "$entry_file" > "$tmp_dir/new_entry.yaml"
  printf "\n" >> "$tmp_dir/new_entry.yaml"
  
  # If archive exists and has content beyond just "entries:", add it after the new entry
  if [[ -s "$archive" ]] && [[ "$(line_count "$archive")" -gt 1 ]]; then
    tail -n +2 "$archive" >> "$tmp_dir/new_entry.yaml"
  fi
  
  # Replace archive with new content
  printf "entries:\n" > "$archive"
  cat "$tmp_dir/new_entry.yaml" >> "$archive"

  # Remove the extracted entry from CHANGELOG (keep everything before last_start)
  head -n $(( last_start - 1 )) "$CHANGELOG" > "$tmp_dir/changelog.new"
  mv "$tmp_dir/changelog.new" "$CHANGELOG"

  echo "Moved 1 entry -> $archive"
done

final_lines="$(line_count "$CHANGELOG")"
echo "Done. $CHANGELOG is now $final_lines lines."