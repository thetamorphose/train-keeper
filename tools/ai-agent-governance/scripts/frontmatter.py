"""Shared YAML-subset frontmatter parser for governance artifacts.

Implements the V2 semantics fixed in the plan v0.4.0 (see AgDR-0002):
- an explicitly quoted value (including `""`) stays a string;
- `- item` lines collect into a list under the nearest eligible parent key
  (indent of the item is deeper than or equal to the key's indent);
- inline lists `[a, b]` parse to Python lists, `true`/`false` to booleans;
- an empty unquoted `key:` still opens a nested mapping.

Tolerant of CRLF line endings. This is deliberately not a YAML library: the
tool has zero external dependencies and the artifact format is a fixed subset.
"""
from __future__ import annotations

from pathlib import Path


def _scalar(value: str):
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [_scalar(part) for part in inner.split(",")]
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    if value == "true":
        return True
    if value == "false":
        return False
    return value


def parse_frontmatter(text: str) -> dict:
    """Parse the leading `---` block of *text* into a dict."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if not text.startswith("---\n"):
        raise ValueError("missing frontmatter")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise ValueError("unterminated frontmatter")
    result: dict = {}
    # stack of (indent, mapping) for nested mappings
    stack: list[tuple[int, dict]] = [(-1, result)]
    # every `key:` line seen, in order: candidates for attaching `- item` lines
    pendings: list[tuple[int, dict, str]] = []
    for raw in text[4:end].split("\n"):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        stripped = raw.strip()
        while len(stack) > 1 and stack[-1][0] >= indent:
            stack.pop()
        container = stack[-1][1]
        if stripped == "-" or stripped.startswith("- "):
            item = _scalar(stripped[2:] if stripped.startswith("- ") else "")
            for p_indent, parent, p_key in reversed(pendings):
                if p_indent > indent:
                    continue
                target = parent.get(p_key)
                if isinstance(target, dict) and not target:
                    target = []
                    parent[p_key] = target
                if isinstance(target, list):
                    target.append(item)
                    break
            continue
        key, sep, value = stripped.partition(":")
        if not sep:
            continue
        key = key.strip()
        value = value.strip()
        pendings.append((indent, container, key))
        if value == "":
            mapping: dict = {}
            container[key] = mapping
            stack.append((indent, mapping))
        else:
            container[key] = _scalar(value)
    return result


def load_frontmatter(path: Path) -> dict:
    return parse_frontmatter(path.read_text(encoding="utf-8"))
