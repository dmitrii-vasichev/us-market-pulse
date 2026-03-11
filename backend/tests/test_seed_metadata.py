import sys
from pathlib import Path

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from seed_metadata import SERIES


def test_series_count():
    assert len(SERIES) == 16


def test_all_series_have_required_fields():
    required = {"series_id", "title", "units", "frequency", "source", "category", "display_order"}
    for s in SERIES:
        missing = required - set(s.keys())
        assert not missing, f"{s['series_id']} missing fields: {missing}"


def test_series_ids_match_prd():
    expected_ids = {
        "GDP", "A191RL1Q225SBEA", "CPIAUCSL", "UNRATE", "FEDFUNDS",
        "MORTGAGE30US", "DGS10", "MSPUS", "HOUST", "RSAFS",
        "PAYEMS", "DCOILWTICO", "SP500", "UMCSENT", "JTSJOL", "INDPRO",
    }
    actual_ids = {s["series_id"] for s in SERIES}
    assert actual_ids == expected_ids


def test_categories_are_valid():
    valid_categories = {"gdp", "inflation", "labor", "rates", "housing", "markets", "sentiment"}
    for s in SERIES:
        assert s["category"] in valid_categories, f"{s['series_id']} has invalid category: {s['category']}"


def test_display_orders_are_unique():
    orders = [s["display_order"] for s in SERIES]
    assert len(orders) == len(set(orders)), "Duplicate display_order values"
