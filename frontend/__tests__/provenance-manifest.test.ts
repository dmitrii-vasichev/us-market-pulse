import fs from "node:fs";
import path from "node:path";

type MethodologyType = "source_backed" | "derived" | "illustrative";
type RuntimeVisibility = "public" | "hidden" | "internal";

interface ManifestUpstreamSource {
  provider: string;
  dataset: string;
  kind: "stored_series" | "live_api_fallback" | "inline_approximation" | "frontend_assumption";
  notes?: string;
}

interface ManifestStorageLocation {
  layer: string;
  reference: string;
}

interface ManifestChartEntry {
  id: string;
  page: "overview" | "labor" | "markets";
  route: "/" | "/labor" | "/markets";
  placement: string;
  component: string;
  endpoint: string;
  current_source_claim: string;
  current_runtime_visibility: RuntimeVisibility;
  public: boolean;
  methodology_type: MethodologyType;
  freshness_cadence: string;
  methodology_note_required: boolean;
  phase_1_requirement: "dynamic_payload_attribution" | "unavailable_state";
  remediation_status: "phase_1_dynamic_attribution" | "phase_2_replace_or_hide" | "phase_3_methodology_note";
  upstream_sources: ManifestUpstreamSource[];
  storage_locations: ManifestStorageLocation[];
}

interface ProvenanceManifest {
  $schema: string;
  version: number;
  inventory_source: string;
  policy_note: string;
  charts: ManifestChartEntry[];
}

type ChartRuntimeExpectation = Pick<
  ManifestChartEntry,
  "id" | "page" | "route" | "component" | "endpoint" | "methodology_type" | "public"
>;

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "config", "provenance-manifest.json");
const SCHEMA_PATH = path.join(REPO_ROOT, "config", "provenance-manifest.schema.json");
const CHART_COMPONENTS_DIR = path.join(REPO_ROOT, "frontend", "src", "components", "charts");
const RESTORED_PHASE_2_COMPONENTS = [
  "CpiHeatmap.tsx",
  "StateScatter.tsx",
  "SectorTreemap.tsx",
  "GdpWaffle.tsx",
];

const CHART_RUNTIME_EXPECTATIONS: ChartRuntimeExpectation[] = [
  { id: "overview.gdp-waterfall", page: "overview", route: "/", component: "GdpWaterfall", endpoint: "/api/v1/gdp/components", methodology_type: "derived", public: true },
  { id: "overview.gdp-quarterly", page: "overview", route: "/", component: "GdpQuarterly", endpoint: "/api/v1/gdp/quarterly", methodology_type: "source_backed", public: true },
  { id: "overview.cpi-calendar", page: "overview", route: "/", component: "CpiCalendar", endpoint: "/api/v1/cpi/calendar", methodology_type: "source_backed", public: true },
  { id: "overview.economic-funnel", page: "overview", route: "/", component: "EconomicFunnel", endpoint: "/api/v1/labor/funnel", methodology_type: "derived", public: true },
  { id: "overview.bullet-targets", page: "overview", route: "/", component: "BulletTargets", endpoint: "/api/v1/kpi/summary", methodology_type: "derived", public: true },
  { id: "overview.gdp-waffle", page: "overview", route: "/", component: "GdpWaffle", endpoint: "/api/v1/sectors/gdp", methodology_type: "derived", public: true },
  { id: "labor.unemployment-bump", page: "labor", route: "/labor", component: "UnemploymentBump", endpoint: "/api/v1/labor/ranking", methodology_type: "source_backed", public: true },
  { id: "labor.cpi-heatmap", page: "labor", route: "/labor", component: "CpiHeatmap", endpoint: "/api/v1/cpi/categories", methodology_type: "source_backed", public: true },
  { id: "labor.state-scatter", page: "labor", route: "/labor", component: "StateScatter", endpoint: "/api/v1/states/comparison", methodology_type: "derived", public: true },
  { id: "labor.economic-funnel", page: "labor", route: "/labor", component: "EconomicFunnel", endpoint: "/api/v1/labor/funnel", methodology_type: "derived", public: true },
  { id: "labor.cpi-calendar", page: "labor", route: "/labor", component: "CpiCalendar", endpoint: "/api/v1/cpi/calendar", methodology_type: "source_backed", public: true },
  { id: "markets.rates-line", page: "markets", route: "/markets", component: "RatesLine", endpoint: "/api/v1/rates/history", methodology_type: "source_backed", public: true },
  { id: "markets.sector-treemap", page: "markets", route: "/markets", component: "SectorTreemap", endpoint: "/api/v1/sectors/gdp", methodology_type: "derived", public: true },
  { id: "markets.sentiment-radial", page: "markets", route: "/markets", component: "SentimentRadial", endpoint: "/api/v1/sentiment/radial", methodology_type: "source_backed", public: true },
  { id: "markets.sp500-area", page: "markets", route: "/markets", component: "Sp500Area", endpoint: "/api/v1/series/SP500", methodology_type: "source_backed", public: true },
  { id: "markets.gdp-waffle", page: "markets", route: "/markets", component: "GdpWaffle", endpoint: "/api/v1/sectors/gdp", methodology_type: "derived", public: true },
];

function readJson<T>(targetPath: string): T {
  return JSON.parse(fs.readFileSync(targetPath, "utf8")) as T;
}

function cloneManifest(manifest: ProvenanceManifest): ProvenanceManifest {
  return JSON.parse(JSON.stringify(manifest)) as ProvenanceManifest;
}

function expectNonEmptyString(value: unknown, fieldName: string, chartId?: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${chartId ?? "manifest"}:${fieldName} must be a non-empty string`);
  }
}

function validateManifest(manifest: ProvenanceManifest) {
  expectNonEmptyString(manifest.$schema, "$schema");
  expectNonEmptyString(manifest.inventory_source, "inventory_source");
  expectNonEmptyString(manifest.policy_note, "policy_note");

  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    throw new Error("manifest:version must be an integer >= 1");
  }

  if (!Array.isArray(manifest.charts) || manifest.charts.length === 0) {
    throw new Error("manifest:charts must contain at least one chart");
  }

  const allowedPages = new Set(["overview", "labor", "markets"]);
  const allowedRoutes = new Set(["/", "/labor", "/markets"]);
  const allowedVisibility = new Set(["public", "hidden", "internal"]);
  const allowedMethodologies = new Set(["source_backed", "derived", "illustrative"]);
  const allowedRequirements = new Set(["dynamic_payload_attribution", "unavailable_state"]);
  const allowedStatuses = new Set(["phase_1_dynamic_attribution", "phase_2_replace_or_hide", "phase_3_methodology_note"]);
  const allowedSourceKinds = new Set(["stored_series", "live_api_fallback", "inline_approximation", "frontend_assumption"]);

  const byId = new Map<string, ManifestChartEntry>();

  for (const chart of manifest.charts) {
    const stringFields: Array<keyof ManifestChartEntry> = [
      "id",
      "page",
      "route",
      "placement",
      "component",
      "endpoint",
      "current_source_claim",
      "current_runtime_visibility",
      "methodology_type",
      "freshness_cadence",
      "phase_1_requirement",
      "remediation_status",
    ];

    for (const field of stringFields) {
      expectNonEmptyString(chart[field], String(field), chart.id);
    }

    if (byId.has(chart.id)) {
      throw new Error(`duplicate chart id: ${chart.id}`);
    }
    byId.set(chart.id, chart);

    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(chart.id)) {
      throw new Error(`${chart.id}: invalid chart id pattern`);
    }
    if (!allowedPages.has(chart.page)) {
      throw new Error(`${chart.id}: invalid page`);
    }
    if (!allowedRoutes.has(chart.route)) {
      throw new Error(`${chart.id}: invalid route`);
    }
    if (!chart.endpoint.startsWith("/api/v1/")) {
      throw new Error(`${chart.id}: endpoint must start with /api/v1/`);
    }
    if (!allowedVisibility.has(chart.current_runtime_visibility)) {
      throw new Error(`${chart.id}: invalid runtime visibility`);
    }
    if (typeof chart.public !== "boolean") {
      throw new Error(`${chart.id}: public must be boolean`);
    }
    if (typeof chart.methodology_note_required !== "boolean") {
      throw new Error(`${chart.id}: methodology_note_required must be boolean`);
    }
    if (!allowedMethodologies.has(chart.methodology_type)) {
      throw new Error(`${chart.id}: invalid methodology type`);
    }
    if (!allowedRequirements.has(chart.phase_1_requirement)) {
      throw new Error(`${chart.id}: invalid phase_1_requirement`);
    }
    if (!allowedStatuses.has(chart.remediation_status)) {
      throw new Error(`${chart.id}: invalid remediation_status`);
    }
    if (!Array.isArray(chart.upstream_sources) || chart.upstream_sources.length === 0) {
      throw new Error(`${chart.id}: upstream_sources must contain at least one entry`);
    }
    if (!Array.isArray(chart.storage_locations) || chart.storage_locations.length === 0) {
      throw new Error(`${chart.id}: storage_locations must contain at least one entry`);
    }

    for (const source of chart.upstream_sources) {
      expectNonEmptyString(source.provider, "upstream_sources.provider", chart.id);
      expectNonEmptyString(source.dataset, "upstream_sources.dataset", chart.id);
      if (!allowedSourceKinds.has(source.kind)) {
        throw new Error(`${chart.id}: invalid upstream source kind`);
      }
    }

    for (const location of chart.storage_locations) {
      expectNonEmptyString(location.layer, "storage_locations.layer", chart.id);
      expectNonEmptyString(location.reference, "storage_locations.reference", chart.id);
    }

    if (chart.methodology_type === "illustrative") {
      if (chart.public) {
        throw new Error(`${chart.id}: illustrative charts cannot be public`);
      }
      if (chart.methodology_note_required) {
        throw new Error(`${chart.id}: illustrative charts cannot require methodology notes`);
      }
      if (chart.phase_1_requirement !== "unavailable_state") {
        throw new Error(`${chart.id}: illustrative charts must use unavailable_state`);
      }
      if (chart.remediation_status !== "phase_2_replace_or_hide") {
        throw new Error(`${chart.id}: illustrative charts must be marked phase_2_replace_or_hide`);
      }
    }

    if (chart.methodology_type === "derived" && !chart.methodology_note_required) {
      throw new Error(`${chart.id}: derived charts must require methodology notes`);
    }

    if (!chart.public && chart.phase_1_requirement !== "unavailable_state") {
      throw new Error(`${chart.id}: non-public charts must use unavailable_state`);
    }
  }

  const missingVisibleCharts = CHART_RUNTIME_EXPECTATIONS
    .filter(({ id }) => !byId.has(id))
    .map(({ id }) => id);
  if (missingVisibleCharts.length > 0) {
    throw new Error(`missing manifest entries for visible charts: ${missingVisibleCharts.join(", ")}`);
  }

  for (const expectation of CHART_RUNTIME_EXPECTATIONS) {
    const chart = byId.get(expectation.id);
    if (!chart) {
      continue;
    }

    for (const [field, expectedValue] of Object.entries(expectation)) {
      if (chart[field as keyof ChartRuntimeExpectation] !== expectedValue) {
        throw new Error(
          `manifest classification mismatch for ${expectation.id}: expected ${field}=${expectedValue}, received ${String(chart[field as keyof ManifestChartEntry])}`,
        );
      }
    }

    if (chart.current_runtime_visibility !== "public") {
      throw new Error(`${expectation.id}: visible chart must remain in current_runtime_visibility=public`);
    }
  }
}

describe("provenance manifest enforcement", () => {
  const manifest = readJson<ProvenanceManifest>(MANIFEST_PATH);
  const schema = readJson<Record<string, unknown>>(SCHEMA_PATH);
  const chartEntry = ((schema.$defs as Record<string, unknown>)?.chartEntry ?? {}) as Record<string, unknown>;
  const chartEntryProperties = ((chartEntry.properties as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const chartEntryAllOf = (chartEntry.allOf as Array<Record<string, unknown>> | undefined) ?? [];

  it("keeps schema invariants for remediation policy", () => {
    expect(schema.required).toEqual(
      expect.arrayContaining(["$schema", "version", "inventory_source", "policy_note", "charts"]),
    );
    expect((chartEntry.required as unknown[])).toEqual(
      expect.arrayContaining([
        "id",
        "page",
        "route",
        "component",
        "endpoint",
        "current_source_claim",
        "current_runtime_visibility",
        "public",
        "methodology_type",
        "methodology_note_required",
        "phase_1_requirement",
        "remediation_status",
      ]),
    );
    expect((chartEntryProperties.methodology_type as { enum: string[] }).enum).toEqual([
      "source_backed",
      "derived",
      "illustrative",
    ]);

    const illustrativePolicy = chartEntryAllOf.find(
      (rule) => (rule.if as { properties?: { methodology_type?: { const?: string } } })?.properties?.methodology_type?.const === "illustrative",
    );
    const derivedPolicy = chartEntryAllOf.find(
      (rule) => (rule.if as { properties?: { methodology_type?: { const?: string } } })?.properties?.methodology_type?.const === "derived",
    );

    expect(
      ((illustrativePolicy?.then as { properties?: { public?: { const?: boolean } } })?.properties?.public?.const),
    ).toBe(false);
    expect(
      ((illustrativePolicy?.then as { properties?: { phase_1_requirement?: { const?: string } } })?.properties?.phase_1_requirement?.const),
    ).toBe("unavailable_state");
    expect(
      ((derivedPolicy?.then as { properties?: { methodology_note_required?: { const?: boolean } } })?.properties?.methodology_note_required?.const),
    ).toBe(true);
  });

  it("validates the manifest against runtime chart expectations", () => {
    expect(() => validateManifest(manifest)).not.toThrow();
    expect(manifest.charts).toHaveLength(CHART_RUNTIME_EXPECTATIONS.length);
  });

  it("fails validation when a visible chart is missing from the manifest", () => {
    const nextManifest = cloneManifest(manifest);
    nextManifest.charts = nextManifest.charts.filter(({ id }) => id !== "markets.sp500-area");

    expect(() => validateManifest(nextManifest)).toThrow(
      "missing manifest entries for visible charts: markets.sp500-area",
    );
  });

  it("fails validation when a visible chart is misclassified", () => {
    const nextManifest = cloneManifest(manifest);
    const chart = nextManifest.charts.find(({ id }) => id === "overview.gdp-waterfall");
    if (!chart) {
      throw new Error("overview.gdp-waterfall missing from fixture manifest");
    }

    chart.methodology_type = "source_backed";
    chart.methodology_note_required = false;

    expect(() => validateManifest(nextManifest)).toThrow(
      "manifest classification mismatch for overview.gdp-waterfall",
    );
  });

  it("blocks hardcoded chart footer literals from reappearing in chart components", () => {
    const violations: string[] = [];

    for (const fileName of fs.readdirSync(CHART_COMPONENTS_DIR).filter((file) => file.endsWith(".tsx"))) {
      const content = fs.readFileSync(path.join(CHART_COMPONENTS_DIR, fileName), "utf8");
      if (/\bSource:\s/.test(content)) {
        violations.push(`${fileName}: hardcoded Source literal`);
      }
      if (/<ChartCard(?:.|\n)*?\bsource=/.test(content)) {
        violations.push(`${fileName}: ChartCard source prop`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("prevents restored Phase 2 charts from reintroducing illustrative unavailable-state branches", () => {
    const violations: string[] = [];

    for (const fileName of RESTORED_PHASE_2_COMPONENTS) {
      const content = fs.readFileSync(path.join(CHART_COMPONENTS_DIR, fileName), "utf8");
      if (content.includes("ChartUnavailableState")) {
        violations.push(`${fileName}: ChartUnavailableState import or usage reintroduced`);
      }
      if (/methodology_type\s*===\s*["']illustrative["']/.test(content)) {
        violations.push(`${fileName}: illustrative methodology gating reintroduced`);
      }
    }

    expect(violations).toEqual([]);
  });
});
