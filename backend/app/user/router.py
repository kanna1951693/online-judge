"""
User profile router: profile stats, activity heatmap, tag distribution, solved list.
All data is computed from real submission records in the database — no fake/hallucinated data.
"""
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, extract

from backend.app.core.database import get_db
from backend.app.db.models import User, Submission, Problem, Verdict, CodeDraft
from backend.app.core.security import get_current_user

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────
class ProfileResponse(BaseModel):
    username: str
    email: str
    profile_hash: str
    google_connected: bool
    member_since: str
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    total_submissions: int
    accuracy: float


class HeatmapDay(BaseModel):
    date: str  # YYYY-MM-DD
    count: int


class HeatmapResponse(BaseModel):
    year: int
    total_submissions: int
    total_active_days: int
    max_streak: int
    current_streak: int
    days: List[HeatmapDay]


class TagStat(BaseModel):
    tag: str
    solved: int
    total: int


class SolvedProblem(BaseModel):
    slug: str
    title: str
    difficulty: str
    solved_at: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────────────────────
def _get_user_by_hash(db: Session, profile_hash: str) -> User:
    user = db.scalar(select(User).where(User.profile_hash == profile_hash))
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user


def _get_solved_problem_ids(db: Session, user_id) -> set:
    """Return set of problem_ids where user has at least one AC submission."""
    rows = db.execute(
        select(Submission.problem_id)
        .where(and_(Submission.user_id == user_id, Submission.verdict == Verdict.AC))
        .distinct()
    ).scalars().all()
    return set(rows)


# ── Profile ──────────────────────────────────────────────────────────────────
@router.get("/profile/{profile_hash}", response_model=ProfileResponse)
def get_profile(profile_hash: str, db: Session = Depends(get_db)):
    user = _get_user_by_hash(db, profile_hash)
    solved_ids = _get_solved_problem_ids(db, user.id)

    # Count by difficulty
    easy = medium = hard = 0
    if solved_ids:
        problems = db.execute(
            select(Problem.id, Problem.difficulty).where(Problem.id.in_(solved_ids))
        ).all()
        for _, diff in problems:
            if diff.value == "Easy":
                easy += 1
            elif diff.value == "Medium":
                medium += 1
            elif diff.value == "Hard":
                hard += 1

    total_submissions = db.scalar(
        select(func.count(Submission.id)).where(Submission.user_id == user.id)
    ) or 0

    ac_submissions = db.scalar(
        select(func.count(Submission.id)).where(
            and_(Submission.user_id == user.id, Submission.verdict == Verdict.AC)
        )
    ) or 0

    accuracy = round((ac_submissions / total_submissions) * 100, 1) if total_submissions > 0 else 0.0

    return ProfileResponse(
        username=user.username,
        email=user.email,
        profile_hash=user.profile_hash,
        google_connected=user.supabase_auth_id is not None,
        member_since=user.created_at.strftime("%b %Y"),
        total_solved=len(solved_ids),
        easy_solved=easy,
        medium_solved=medium,
        hard_solved=hard,
        total_submissions=total_submissions,
        accuracy=accuracy,
    )


# ── Heatmap ──────────────────────────────────────────────────────────────────
@router.get("/profile/{profile_hash}/heatmap", response_model=HeatmapResponse)
def get_heatmap(profile_hash: str, year: Optional[int] = None, db: Session = Depends(get_db)):
    user = _get_user_by_hash(db, profile_hash)

    now = datetime.now(timezone.utc)
    if year is None:
        year = now.year

    # Date range: Jan 1 → Dec 31 of the selected year
    start = datetime(year, 1, 1, tzinfo=timezone.utc)
    end = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

    # Query daily submission counts
    rows = db.execute(
        select(
            func.date(Submission.submitted_at).label("day"),
            func.count(Submission.id).label("cnt"),
        )
        .where(and_(
            Submission.user_id == user.id,
            Submission.submitted_at >= start,
            Submission.submitted_at <= end,
        ))
        .group_by(func.date(Submission.submitted_at))
        .order_by(func.date(Submission.submitted_at))
    ).all()

    day_counts = {str(r.day): r.cnt for r in rows}

    # Build full day list for the year
    days = []
    total_submissions = 0
    active_dates = set()
    current = start.date()
    end_date = min(end.date(), now.date())

    while current <= end_date:
        date_str = str(current)
        count = day_counts.get(date_str, 0)
        days.append(HeatmapDay(date=date_str, count=count))
        total_submissions += count
        if count > 0:
            active_dates.add(current)
        current += timedelta(days=1)

    # Compute streaks
    sorted_dates = sorted(active_dates)
    max_streak = 0
    current_streak = 0

    if sorted_dates:
        streak = 1
        for i in range(1, len(sorted_dates)):
            if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
                streak += 1
            else:
                max_streak = max(max_streak, streak)
                streak = 1
        max_streak = max(max_streak, streak)

        # Current streak (ending today or yesterday)
        today = now.date()
        if sorted_dates[-1] >= today - timedelta(days=1):
            current_streak = 1
            for i in range(len(sorted_dates) - 2, -1, -1):
                if (sorted_dates[i + 1] - sorted_dates[i]).days == 1:
                    current_streak += 1
                else:
                    break

    return HeatmapResponse(
        year=year,
        total_submissions=total_submissions,
        total_active_days=len(active_dates),
        max_streak=max_streak,
        current_streak=current_streak,
        days=days,
    )


# ── Tag distribution ─────────────────────────────────────────────────────────
@router.get("/profile/{profile_hash}/tags", response_model=List[TagStat])
def get_tag_stats(profile_hash: str, db: Session = Depends(get_db)):
    user = _get_user_by_hash(db, profile_hash)
    solved_ids = _get_solved_problem_ids(db, user.id)

    # Get all problems with their tags
    all_problems = db.execute(select(Problem.id, Problem.tags)).all()

    tag_total = defaultdict(int)
    tag_solved = defaultdict(int)

    for prob_id, tags in all_problems:
        if tags:
            for tag in tags:
                tag_total[tag] += 1
                if prob_id in solved_ids:
                    tag_solved[tag] += 1

    result = []
    for tag in sorted(tag_total.keys()):
        result.append(TagStat(tag=tag, solved=tag_solved.get(tag, 0), total=tag_total[tag]))

    return result


# ── Solved problems list ─────────────────────────────────────────────────────
@router.get("/profile/{profile_hash}/solved", response_model=List[SolvedProblem])
def get_solved_problems(profile_hash: str, db: Session = Depends(get_db)):
    user = _get_user_by_hash(db, profile_hash)

    # Get first AC submission per problem
    subq = (
        select(
            Submission.problem_id,
            func.min(Submission.submitted_at).label("first_ac"),
        )
        .where(and_(Submission.user_id == user.id, Submission.verdict == Verdict.AC))
        .group_by(Submission.problem_id)
        .subquery()
    )

    rows = db.execute(
        select(Problem.slug, Problem.title, Problem.difficulty, subq.c.first_ac)
        .join(subq, Problem.id == subq.c.problem_id)
        .order_by(subq.c.first_ac.desc())
    ).all()

    return [
        SolvedProblem(
            slug=r.slug,
            title=r.title,
            difficulty=r.difficulty.value,
            solved_at=r.first_ac.strftime("%Y-%m-%d %H:%M") if r.first_ac else None,
        )
        for r in rows
    ]


# ── Code Drafts ───────────────────────────────────────────────────────────────

class DraftSavePayload(BaseModel):
    problem_slug: str
    language: str
    code: str


class DraftResponse(BaseModel):
    problem_slug: str
    language: str
    code: str


@router.put("/draft", response_model=DraftResponse)
def save_draft(
    payload: DraftSavePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upsert the user's in-progress code draft for a given problem + language."""
    draft = db.scalar(
        select(CodeDraft).where(
            and_(
                CodeDraft.user_id == current_user.id,
                CodeDraft.problem_slug == payload.problem_slug,
                CodeDraft.language == payload.language,
            )
        )
    )
    if draft:
        draft.code = payload.code
        draft.updated_at = func.now()
    else:
        draft = CodeDraft(
            user_id=current_user.id,
            problem_slug=payload.problem_slug,
            language=payload.language,
            code=payload.code,
        )
        db.add(draft)
    db.commit()
    db.refresh(draft)
    return DraftResponse(
        problem_slug=draft.problem_slug,
        language=draft.language,
        code=draft.code,
    )


@router.get("/draft/{problem_slug}/{language}", response_model=DraftResponse)
def get_draft(
    problem_slug: str,
    language: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch the user's saved draft for a given problem + language. Returns 404 if none."""
    draft = db.scalar(
        select(CodeDraft).where(
            and_(
                CodeDraft.user_id == current_user.id,
                CodeDraft.problem_slug == problem_slug,
                CodeDraft.language == language,
            )
        )
    )
    if not draft:
        raise HTTPException(status_code=404, detail="No draft found")
    return DraftResponse(
        problem_slug=draft.problem_slug,
        language=draft.language,
        code=draft.code,
    )
