"""Collector for annual BLS CPI relative-importance snapshots."""

from __future__ import annotations

from datetime import date
from html.parser import HTMLParser

import httpx

BLS_RELATIVE_IMPORTANCE_URL = "https://www.bls.gov/cpi/tables/relative-importance/{year}.htm"

CPI_CATEGORY_SPECS = [
    {
        "category_key": "housing",
        "category_label": "Housing",
        "source_label": "Housing",
        "display_order": 1,
    },
    {
        "category_key": "food",
        "category_label": "Food & Beverages",
        "source_label": "Food and beverages",
        "display_order": 2,
    },
    {
        "category_key": "transport",
        "category_label": "Transportation",
        "source_label": "Transportation",
        "display_order": 3,
    },
    {
        "category_key": "medical",
        "category_label": "Medical Care",
        "source_label": "Medical care",
        "display_order": 4,
    },
    {
        "category_key": "education",
        "category_label": "Education & Communication",
        "source_label": "Education and communication",
        "display_order": 5,
    },
    {
        "category_key": "recreation",
        "category_label": "Recreation",
        "source_label": "Recreation",
        "display_order": 6,
    },
    {
        "category_key": "apparel",
        "category_label": "Apparel",
        "source_label": "Apparel",
        "display_order": 7,
    },
    {
        "category_key": "other",
        "category_label": "Other Goods & Services",
        "source_label": "Other goods and services",
        "display_order": 8,
    },
]


class RelativeImportanceTableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.rows: list[list[str]] = []
        self._current_row: list[str] = []
        self._current_cell: list[str] = []
        self._in_row = False
        self._in_cell = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "tr":
            self._in_row = True
            self._current_row = []
        elif self._in_row and tag in {"td", "th"}:
            self._in_cell = True
            self._current_cell = []

    def handle_data(self, data: str) -> None:
        if self._in_cell:
            self._current_cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._in_cell:
            cell_text = " ".join(part.strip() for part in self._current_cell if part.strip()).strip()
            if cell_text:
                self._current_row.append(cell_text)
            self._current_cell = []
            self._in_cell = False
        elif tag == "tr" and self._in_row:
            if self._current_row:
                self.rows.append(self._current_row)
            self._current_row = []
            self._in_row = False


def _parse_numeric_cell(raw_value: str) -> float | None:
    cleaned = raw_value.replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_cpi_relative_importance_html(html: str, year: int) -> list[dict]:
    parser = RelativeImportanceTableParser()
    parser.feed(html)

    values_by_label: dict[str, float] = {}
    for row in parser.rows:
        if len(row) < 2:
            continue
        numeric_value = _parse_numeric_cell(row[1])
        if numeric_value is None:
            continue
        values_by_label[row[0].strip()] = numeric_value

    snapshot_date = date(year, 12, 1)
    rows: list[dict] = []
    missing_labels: list[str] = []
    for spec in CPI_CATEGORY_SPECS:
        value = values_by_label.get(spec["source_label"])
        if value is None:
            missing_labels.append(spec["source_label"])
            continue

        rows.append(
            {
                "snapshot_date": snapshot_date,
                "period_label": f"Dec {year}",
                "category_key": spec["category_key"],
                "category_label": spec["category_label"],
                "display_order": spec["display_order"],
                "relative_importance": value,
                "source_provider": "BLS",
                "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
                "source_metadata": {
                    "source_label": spec["source_label"],
                    "release_year": year,
                    "source_url": BLS_RELATIVE_IMPORTANCE_URL.format(year=year),
                },
            }
        )

    if missing_labels:
        raise ValueError(
            "Missing CPI relative-importance categories: " + ", ".join(sorted(missing_labels))
        )

    return rows


async def fetch_cpi_category_snapshots(
    client: httpx.AsyncClient,
    years: list[int],
) -> list[dict]:
    rows: list[dict] = []
    for year in sorted(set(years)):
        response = await client.get(BLS_RELATIVE_IMPORTANCE_URL.format(year=year))
        response.raise_for_status()
        rows.extend(parse_cpi_relative_importance_html(response.text, year))
    return rows
