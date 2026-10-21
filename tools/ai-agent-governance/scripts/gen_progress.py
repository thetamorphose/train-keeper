"""Generate docs/progress.md deterministically from primary records (read-only).

Sources: tasks/*.md, specs/*/spec.md + tasks.md, bugs/{inbox,triaged,fixed}/*.md,
tech-debt.md and `git log` commits carrying a `Task:` trailer.

Determinism (see AgDR-0002): the "Обновлено" line is derived from record dates
(newest created/updated), never from the wall clock, so two runs over the same
repository produce byte-identical output. `--check` compares the generated
document with docs/progress.md ignoring the git-activity section: a commit
changes that snapshot by definition, and the regeneration commit cannot contain
its own hash. Everything else (tasks, specs, bugs, tech-debt) is compared
exactly.

Usage:
    python gen_progress.py --project-root .           # write docs/progress.md
    python gen_progress.py --project-root . --stdout  # print, do not write
    python gen_progress.py --project-root . --check   # exit 1 if missing/stale
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
from pathlib import Path

from frontmatter import load_frontmatter

CHECKBOX = re.compile(r"^\s*-\s\[( |x|X)\]")
DATE = re.compile(r"\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?")
NEEDS = "[NEEDS CLARIFICATION]"
ACTIVITY_HEADER = "## Активность"
GENERATED_HEADER = "# Project State (generated — do not edit; run gen_progress.py)"


def task_records(root: Path) -> list[dict]:
    records = []
    tasks_dir = root / "tasks"
    if not tasks_dir.is_dir():
        return records
    for path in sorted(tasks_dir.glob("*.md")):
        if path.name == "index.md":
            continue
        try:
            data = load_frontmatter(path)
        except ValueError:
            continue
        text = path.read_text(encoding="utf-8")
        ac = ac_checkboxes(text)
        records.append(
            {
                "id": data.get("id") or path.stem,
                "title": str(data.get("title", "")).strip('"'),
                "status": str(data.get("status", "unknown")),
                "commits": commit_list(data.get("result", {})),
                "specs": as_list((data.get("related") or {}).get("specs")),
                "ac_done": ac[1],
                "ac_total": ac[0] + ac[1],
                "dates": [str(v) for k, v in flat_scalars(data) if k.rsplit(".", 1)[-1] in {"created", "updated"}],
            }
        )
    return records


def ac_checkboxes(text: str) -> tuple[int, int]:
    """Return (open, done) checkbox counts inside the `## Acceptance criteria` section."""
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


def flat_scalars(data: dict, prefix: str = ""):
    for key, value in data.items():
        name = f"{prefix}{key}"
        if isinstance(value, dict):
            yield from flat_scalars(value, f"{name}.")
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, str):
                    yield name, item
        else:
            yield name, value


def commit_list(result) -> list[str]:
    if not isinstance(result, dict):
        return []
    commits = result.get("commits")
    if isinstance(commits, list):
        values = [str(c) for c in commits if c]
    elif commits:
        values = [str(commits)]
    else:
        single = result.get("commit")
        values = [str(single)] if single else []
    return values


def as_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def spec_records(root: Path) -> list[dict]:
    records = []
    specs_dir = root / "specs"
    if not specs_dir.is_dir():
        return records
    for spec_dir in sorted(p for p in specs_dir.iterdir() if p.is_dir()):
        done = open_n = clarif = ac_open = ac_done = 0
        for name in ("spec.md", "plan.md", "tasks.md"):
            path = spec_dir / name
            if not path.exists():
                continue
            text = path.read_text(encoding="utf-8")
            body = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
            clarif += body.count(NEEDS)
            if name == "tasks.md":
                in_dod = False
                for line in body.replace("\r\n", "\n").split("\n"):
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
                            done += 1
        records.append(
            {
                "dir": f"specs/{spec_dir.name}",
                "steps_done": done,
                "steps_total": done + open_n,
                "clarif": clarif,
                "ac_open": ac_open,
                "ac_done": ac_done,
            }
        )
    return records


def bug_records(root: Path) -> list[dict]:
    records = []
    for area in ("inbox", "triaged", "fixed"):
        area_dir = root / "bugs" / area
        if not area_dir.is_dir():
            continue
        for path in sorted(area_dir.glob("*.md")):
            try:
                data = load_frontmatter(path)
            except ValueError:
                continue
            created = ""
            for key in ("created",):
                value = data.get(key)
                if value:
                    created = str(value).strip('"')[:10]
            records.append(
                {
                    "id": str(data.get("id") or path.stem),
                    "status": str(data.get("status", "unknown")),
                    "area": area,
                    "created": created,
                }
            )
    return records


def tech_debt_rows(root: Path) -> list[tuple[str, str]]:
    path = root / "tech-debt.md"
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"):
        line = line.strip()
        if not line.startswith("|") or set(line) <= {"|", "-", " "}:
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2 or cells[0].lower() == "id":
            continue
        rows.append((cells[0], cells[1]))
    return rows


def git_activity(root: Path, limit: int = 8) -> list[dict]:
    try:
        out = subprocess.check_output(
            ["git", "-C", str(root), "log", "-n", "50", "--format=%H%x1f%h%x1f%s%x1f%cI%x1f%b%x1e"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, OSError):
        return []
    entries = []
    for chunk in out.split("\x1e"):
        if not chunk.strip():
            continue
        parts = chunk.strip("\n").split("\x1f")
        if len(parts) < 5:
            continue
        short, subject, date, body = parts[1], parts[2], parts[3], "\x1f".join(parts[4:])
        match = re.search(r"^Task:\s*(\S+)\s*$", body, re.MULTILINE)
        if match:
            entries.append({"hash": short, "date": date[:10], "subject": subject, "task": match.group(1)})
        if len(entries) >= limit:
            break
    return entries


def state_timestamp(tasks: list[dict], bugs: list[dict]) -> str:
    dates: list[str] = []
    for task in tasks:
        dates.extend(task["dates"])
    for bug in bugs:
        if bug["created"]:
            dates.append(bug["created"])
    matches = [m for value in dates for m in DATE.findall(value)]
    if not matches:
        return "unknown"
    newest = max(matches)
    return newest if "T" in newest else f"{newest}T00:00:00Z"


def _age(anchor: str, created: str) -> str:
    try:
        anchor_dt = dt.date.fromisoformat(anchor[:10])
        created_dt = dt.date.fromisoformat(created[:10])
    except ValueError:
        return ""
    days = (anchor_dt - created_dt).days
    if days < 7:
        return f"{days} дн."
    return f"{days // 7} нед."


def render(root: Path) -> str:
    """Render the full progress document for *root* (deterministic)."""
    tasks = task_records(root)
    specs = spec_records(root)
    bugs = bug_records(root)
    debt = tech_debt_rows(root)
    activity = git_activity(root)
    anchor = state_timestamp(tasks, bugs)

    lines = [
        GENERATED_HEADER,
        f"Обновлено: {anchor}. Источники: tasks/, specs/, bugs/, tech-debt.md, git log.",
        "",
        "## Реализовано",
    ]
    done_tasks = [t for t in tasks if t["status"] == "done"]
    for task in done_tasks:
        line = f"- {task['id']} «{task['title']}» — done"
        if task["commits"]:
            line += f", коммиты [{', '.join(task['commits'])}]"
        if task["specs"]:
            line += " → " + ", ".join(task["specs"])
        lines.append(line)
    if not done_tasks:
        lines.append("- нет")

    lines += ["", "## В работе / запланировано"]
    pending = [t for t in tasks if t["status"] != "done"]
    for task in pending:
        lines.append(f"- {task['id']} «{task['title']}» — {task['status']}")
    if not pending:
        lines.append("- нет")

    lines += ["", "## Спеки"]
    if specs:
        for spec in specs:
            line = f"- {spec['dir']}: шаги {spec['steps_done']}/{spec['steps_total']}"
            if spec["ac_done"] or spec["ac_open"]:
                line += ", AC " + ("закрыты" if spec["ac_open"] == 0 else f"открыто: {spec['ac_open']}")
            if spec["clarif"]:
                line += f", {NEEDS}: {spec['clarif']}"
            lines.append(line)
    else:
        lines.append("- нет")

    lines += ["", "## Открыто"]
    if bugs:
        rendered = []
        for bug in bugs:
            item = f"{bug['id']} ({bug['status']}"
            if bug["created"]:
                item += f", создан {bug['created']}"
                age = _age(anchor, bug["created"])
                if age:
                    item += f", {age}"
            rendered.append(item + ")")
        lines.append("- Баги: " + "; ".join(rendered))
    else:
        lines.append("- Баги: нет")
    if debt:
        lines.append("- Tech-debt: " + "; ".join(f"{row[0]} ({row[1]})" for row in debt))
    else:
        lines.append("- Tech-debt: нет")
    open_questions = [
        f"{spec['dir']}: {NEEDS} ×{spec['clarif']}" for spec in specs if spec["clarif"]
    ]
    if open_questions:
        lines.append("- Вопросы спек: " + "; ".join(open_questions))
    else:
        lines.append("- Вопросы спек: нет")

    lines += ["", f"{ACTIVITY_HEADER} (git, коммиты с Task:)"]
    if activity:
        for entry in activity:
            lines.append(f"- {entry['hash']} {entry['date']} {entry['subject']} ({entry['task']})")
    else:
        lines.append("- нет")
    return "\n".join(lines) + "\n"


def strip_activity(text: str) -> str:
    """Drop the git-activity section: it is a snapshot that self-drifts (AgDR-0002)."""
    out = []
    skipping = False
    for line in text.replace("\r\n", "\n").split("\n"):
        if line.startswith(ACTIVITY_HEADER):
            skipping = True
            continue
        if skipping and line.startswith("## "):
            skipping = False
        if not skipping:
            out.append(line)
    return "\n".join(out)


def is_fresh(root: Path) -> bool:
    """True when docs/progress.md exists and matches the current records."""
    path = root / "docs" / "progress.md"
    if not path.exists():
        return False
    current = path.read_text(encoding="utf-8")
    return strip_activity(current) == strip_activity(render(root))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--check", action="store_true", help="write nothing; exit 1 if missing or stale")
    parser.add_argument("--stdout", action="store_true", help="print instead of writing")
    args = parser.parse_args()
    root = args.project_root.resolve()
    if args.check:
        if is_fresh(root):
            print("PROGRESS_OK")
            return 0
        print("PROGRESS_STALE docs/progress.md missing or out of date; run gen_progress.py")
        return 1
    text = render(root)
    if args.stdout:
        print(text, end="")
        return 0
    target = root / "docs" / "progress.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    print(f"PROGRESS_WRITTEN {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
