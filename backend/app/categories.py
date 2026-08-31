"""Arena categories. Kept in code — adding one is a deploy, matching how the
real product gates categories on prompt templates + judge support."""
from __future__ import annotations

CATEGORIES: dict[str, dict[str, str]] = {
    "website": {
        "name": "Website",
        "blurb": "Landing pages and full sites, judged on layout, hierarchy, and polish.",
    },
    "ui-component": {
        "name": "UI Component",
        "blurb": "Single components — cards, forms, pickers — judged on craft and usability.",
    },
    "dataviz": {
        "name": "Data Viz",
        "blurb": "Charts and dashboards, judged on clarity and visual encoding.",
    },
    "game": {
        "name": "Game",
        "blurb": "Playable browser mini-games, judged on fun and feel.",
    },
    "svg-logo": {
        "name": "Logo / SVG",
        "blurb": "Vector marks and illustrations, judged on concept and execution.",
    },
    "ascii-art": {
        "name": "ASCII Art",
        "blurb": "Terminal-style art, judged on ingenuity within the medium.",
    },
}

OVERALL = "overall"


def is_valid_category(slug: str) -> bool:
    return slug in CATEGORIES
