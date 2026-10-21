"""Validate local governance artifacts without external dependencies.

Semantics (owner-guide §5): ERROR = broken artifacts, WARNING = drift signals;
`--strict` fails on both. Drift checks N1-N7 come from the plan v0.4.0
(docs/plan-2026-10-17-v0-4-0.md), see AgDR-0002 for technical decisions.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
from pathlib import Path

import gen_progress
from frontmatter import load_frontmatter, parse_frontmatter

REQUIRED_TASK = {"id", "title", "status", "created", "checkpoint", "result", "related"}
TASK_ID = re.compile(r"^task-\d{4}-\d{2}-\d{2}-\d{3}$")
SESSION_ID = re.compile(r"^\d{8}_\d{6}_[0-9a-f]{6}$")
HASH = re.compile(r"[0-9a-f]{7,64}")
RAW_SECRET = re.compile(r"\bsk-[A-Za-z0-9_-]{16,}|\bgh[pousr]_[A-Za-z0-9_]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}")
CHECKBOX = re.compile(r"^\s*-\s\[( |x|X)\]")
LEGACY_VERSION = re.compile(r"product-agent-governance@(\d+)\.(\d+)\.(\d+)")

# V1 (feature task must reference a spec) applies to records produced by the
# 0.4.0+ protocol only; older records are read as-is (plan: low compatibility
# impact), see AgDR-0002 decision 8.
V1_MIN_VERSION = (0, 4, 0)


def _as_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def _dict(value) -> dict:
    return value if isinstance(value, dict) else {}


def _skill_version(data: dict) -> tuple[int, int, int] | None:
    match = LEGACY_VERSION.search(str(data.get("skill_version", "")))
    if not match:
        return None
    return (int(match.group(1)), int(match.group(2)), int(match.group(3)))


def _checkboxes(text: str) -> tuple[int, int]:
    open_n = done_n = 0
    in_section = False
    for line in text.replace("\r\n", "\n").split("\n"):
        if line.startswith("## "):
            in_section = "acceptance criteria" in line.lower()
            continue
        if in_section:
            match = CHECKBOX.match(line)
            if match:
                if match.group(1) == " ":
                    open_n += 1
                else:
                    done_n += 1
    return open_n, done_n


def git_message(root: Path, commit: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(root), "show", "-s", "--format=%B", commit], text=True
    )


def check_tasks(root: Path, errors: list[str], warnings: list[str]) -> dict[str, dict]:
    """Check task records; return {task_id: data} for cross-checks."""
    known: dict[str, dict] = {}
    for task in sorted((root / "tasks").glob("*.md")):
        if task.name == "index.md":
            continue
        try:
            data = load_frontmatter(task)
        except ValueError as exc:
            errors.append(f"{task}: {exc}")
            continue
        missing = REQUIRED_TASK - data.keys()
        if missing:
            errors.append(f"{task}: missing fields {sorted(missing)}")
        task_id = str(data.get("id", ""))
        if not TASK_ID.match(task_id):
            errors.append(f"{task}: invalid task id {task_id!r}")
        if task_id in known:
            errors.append(f"{task}: duplicate task id {task_id}")
        known[task_id] = data
        tags = _as_list(data.get("tags"))
        related = _dict(data.get("related"))
        specs = _as_list(related.get("specs"))
        version = _skill_version(data)
        # V1: feature task without a spec reference. Legacy records (produced
        # before the 0.4.0 spec-first protocol) are read as-is while they stay
        # done; in-flight records are always checked (AgDR-0002 decision 8).
        legacy_done = version is not None and version < V1_MIN_VERSION and data.get("status") == "done"
        if "feature" in tags and not specs and not legacy_done:
            warnings.append(
                f"{task}: feature task does not reference a specs/ entry in related.specs"
            )
        # N4: Hermes session id format
        for session in _as_list(data.get("hermes_sessions")):
            if session and not SESSION_ID.match(session):
                warnings.append(f"{task}: session id {session!r} does not match Hermes format")
        # N7: related.* must reference existing paths
        for group in ("specs", "adr", "agdr", "bugs"):
            for ref in _as_list(related.get(group)):
                if "/" in ref and not (root / ref).exists():
                    warnings.append(f"{task}: related.{group} references missing path {ref!r}")
        if data.get("status") == "done":
            checkpoint = _dict(data.get("checkpoint"))
            result = _dict(data.get("result"))
            commits = gen_progress.commit_list(result)
            if not checkpoint.get("git_head") or not commits or not result.get("test_result"):
                errors.append(f"{task}: completed task lacks checkpoint/commit/test result")
            else:
                for commit in commits:
                    if not HASH.fullmatch(commit):
                        warnings.append(f"{task}: malformed result commit id {commit!r}")
                        continue
                    try:
                        if f"Task: {task_id}" not in git_message(root, commit):
                            warnings.append(f"{task}: commit lacks Task trailer")
                    except subprocess.CalledProcessError:
                        # V3: a missing commit is drift (history rewritten), not breakage
                        warnings.append(f"{task}: commit not found (history rewritten?)")
            # N5: done task must have all acceptance criteria checked
            body = task.read_text(encoding="utf-8")
            ac_open, ac_done = _checkboxes(body)
            if ac_open > 0 or ac_done == 0:
                warnings.append(f"{task}: done task has empty/unchecked acceptance criteria")
    return known


def check_specs(root: Path, known_tasks: dict[str, dict], warnings: list[str]) -> dict[str, dict]:
    """Check spec directories; return {spec_dir_name: steps_state} for N2."""
    spec_states: dict[str, dict] = {}
    for spec_dir in sorted((root / "specs").glob("*/")):
        if not (spec_dir / "spec.md").exists():
            warnings.append(f"{spec_dir}: spec directory lacks spec.md")
        plan = spec_dir / "plan.md"
        if plan.exists():
            text = plan.read_text(encoding="utf-8")
            if "Architecture linkage" not in text:
                warnings.append(f"{plan}: missing mandatory 'Architecture linkage' section")
        elif (spec_dir / "spec.md").exists():
            warnings.append(f"{spec_dir}: spec.md exists without plan.md")
        tasks_md = spec_dir / "tasks.md"
        open_n = done_n = 0
        if tasks_md.exists():
            in_dod = False
            for line in tasks_md.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"):
                if line.startswith("## "):
                    in_dod = "definition of done" in line.lower()
                    continue
                if in_dod:
                    continue
                match = CHECKBOX.match(line)
                if match:
                    if match.group(1) == " ":
                        open_n += 1
                    else:
                        done_n += 1
        spec_states[spec_dir.name] = {"open": open_n, "done": done_n}
    # N2: a done task while every step of its spec is still open
    for task_id, data in known_tasks.items():
        if data.get("status") != "done":
            continue
        related = _dict(data.get("related"))
        for ref in _as_list(related.get("specs")):
            name = ref.rstrip("/").rsplit("/", 1)[-1]
            state = spec_states.get(name)
            if state and state["open"] > 0 and state["done"] == 0:
                warnings.append(
                    f"tasks/{task_id}: task is done but all steps of {ref} are still open"
                )
    return spec_states


def check_session_map(root: Path, known_tasks: dict[str, dict], warnings: list[str]) -> None:
    """N3: stale task_id or deprecated `status` field; N4: session id format."""
    path = root / "logs" / "task-session-map.yml"
    if not path.exists():
        return
    current: str | None = None
    for line_no, line in enumerate(path.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), 1):
        stripped = line.strip()
        if stripped.startswith("- task_id:"):
            current = stripped.partition(":")[2].strip().strip('"')
            if current not in known_tasks:
                warnings.append(f"{path}:{line_no}: session map references unknown task_id {current!r}")
        elif stripped.startswith("session_ids:"):
            inner = stripped.partition(":")[2].strip()
            for session in re.findall(r"[\"']?([^\"',\[\]]+)[\"']?", inner):
                session = session.strip()
                if session and not SESSION_ID.match(session):
                    warnings.append(f"{path}:{line_no}: session id {session!r} does not match Hermes format")
        elif stripped.startswith("status:"):
            warnings.append(f"{path}:{line_no}: deprecated field 'status' in session map (task_id={current!r})")


def check_bugs(root: Path, warnings: list[str]) -> None:
    """N6: a bug sitting in bugs/inbox/ for more than 14 days was not triaged."""
    inbox = root / "bugs" / "inbox"
    if not inbox.is_dir():
        return
    today = dt.datetime.now(dt.timezone.utc).date()
    for path in sorted(inbox.glob("*.md")):
        try:
            data = load_frontmatter(path)
        except ValueError:
            continue
        created = str(data.get("created", "")).strip('"')[:10]
        try:
            age = (today - dt.date.fromisoformat(created)).days
        except ValueError:
            age = (today - dt.date.fromtimestamp(path.stat().st_mtime)).days
        if age > 14:
            warnings.append(f"{path}: bug in inbox for {age} days without triage")


def check_progress(root: Path, warnings: list[str]) -> None:
    """N1: docs/progress.md must exist and match the primary records."""
    if not (root / "docs" / "progress.md").exists():
        warnings.append("docs/progress.md is missing; run gen_progress.py")
    elif not gen_progress.is_fresh(root):
        warnings.append("docs/progress.md is stale; run gen_progress.py")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    root = args.project_root.resolve()
    errors: list[str] = []
    warnings: list[str] = []

    known_tasks = check_tasks(root, errors, warnings)
    check_specs(root, known_tasks, warnings)
    check_session_map(root, known_tasks, warnings)
    check_bugs(root, warnings)
    check_progress(root, warnings)

    for log in sorted((root / "logs" / "tasks").glob("*.jsonl")):
        for line_no, line in enumerate(log.read_text(encoding="utf-8").splitlines(), 1):
            try:
                json.loads(line)
            except json.JSONDecodeError:
                errors.append(f"{log}:{line_no}: invalid JSONL")
            if RAW_SECRET.search(line):
                errors.append(f"{log}:{line_no}: apparent unredacted secret")
    for path in [root / "AGENTS.md", root / "CORE.md", root / "docs/constitution.md", root / "tech-debt.md"]:
        if not path.exists():
            errors.append(f"missing required artifact: {path}")

    for message in errors:
        print("ERROR", message)
    for message in warnings:
        print("WARNING", message)
    if errors or (args.strict and warnings):
        return 1
    print(f"VALIDATION_OK tasks={len(known_tasks)} warnings={len(warnings)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
