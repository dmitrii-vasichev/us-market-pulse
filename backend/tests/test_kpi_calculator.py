from decimal import Decimal

from app.services.kpi_calculator import compute_change, format_period_label, KPI_DEFINITIONS


def test_compute_change_basic():
    result = compute_change(Decimal("110"), Decimal("100"), "qoq")
    assert result["absolute"] == 10.0
    assert result["percent"] == 10.0


def test_compute_change_negative():
    result = compute_change(Decimal("90"), Decimal("100"), "mom")
    assert result["absolute"] == -10.0
    assert result["percent"] == -10.0


def test_compute_change_yoy_percentage():
    # CPI: 300 now, 290 a year ago → ~3.45% inflation
    result = compute_change(Decimal("300"), Decimal("290"), "yoy")
    assert result["absolute"] == 3.4  # YoY returns percentage as absolute
    assert result["percent"] == 3.45


def test_compute_change_zero_previous():
    result = compute_change(Decimal("100"), Decimal("0"), "qoq")
    assert result["absolute"] == 0
    assert result["percent"] == 0


def test_format_period_label():
    assert format_period_label("qoq") == "QoQ"
    assert format_period_label("yoy") == "YoY"
    assert format_period_label("mom") == "MoM"
    assert format_period_label("ytd") == "YTD"
    assert format_period_label("unknown") == ""


def test_kpi_definitions_have_required_keys():
    required = {"series_id", "label", "comparison", "format", "positive_is_good"}
    for key, defn in KPI_DEFINITIONS.items():
        missing = required - set(defn.keys())
        assert not missing, f"KPI '{key}' missing: {missing}"


def test_kpi_definitions_count():
    assert len(KPI_DEFINITIONS) == 4


def test_kpi_color_logic():
    # GDP up = good, inflation up = bad, unemployment up = bad, fed rate up = bad
    assert KPI_DEFINITIONS["gdp"]["positive_is_good"] is True
    assert KPI_DEFINITIONS["cpi"]["positive_is_good"] is False
    assert KPI_DEFINITIONS["unemployment"]["positive_is_good"] is False
    assert KPI_DEFINITIONS["fed_rate"]["positive_is_good"] is False
