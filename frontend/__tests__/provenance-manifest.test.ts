import fs from "node:fs";
import path from "node:path";

type MethodologyType = "source_backed" | "derived" | "illustrative";
type RuntimeVisibility = "public" | "hidden" | "internal";
type UpstreamSourceKind =
  | "stored_series"
  | "stored_snapshot"
  | "live_api_fallback"
  | "inline_approximation"
  | "frontend_assumption";
type Phase2MethodologyType = Exclude<MethodologyType, "illustrative">;

interface ManifestUpstreamSource {
  provider: string;
  dataset: string;
  kind: UpstreamSourceKind;
  notes?: string;
}

interface ManifestStorageLocation {
  layer: string;
  reference: string;
}

interface ManifestPhase2TargetContract {
  public: boolean;
  methodology_type: Phase2MethodologyType;
  freshness_cadence: string;
  methodology_note_required: boolean;
  source_claim_template: string;
  transformation_summary?: string;
  upstream_sources: ManifestUpstreamSource[];
  storage_locations: ManifestStorageLocation[];
}

type ManifestPhase3TargetContract = ManifestPhase2TargetContract;

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
  phase_2_target_contract?: ManifestPhase2TargetContract;
  phase_3_target_contract?: ManifestPhase3TargetContract;
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

interface Phase2TargetExpectation {
  id: string;
  methodology_type: Phase2MethodologyType;
  freshness_cadence: string;
  methodology_note_required: boolean;
  source_claim_template: string;
  transformation_summary?: string;
  upstream_datasets: string[];
  storage_layers: string[];
}

type Phase3TargetExpectation = Phase2TargetExpectation;

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

const PHASE_2_TARGET_EXPECTATIONS: Phase2TargetExpectation[] = [
  {
    id: "overview.gdp-waffle",
    methodology_type: "derived",
    freshness_cadence: "quarterly",
    methodology_note_required: true,
    source_claim_template: "Source: BEA GDP by Industry · Q<quarter> <year>",
    transformation_summary:
      "Map official BEA current-dollar value-added industries into one shared sector hierarchy used by both the treemap and waffle without introducing handcrafted percentage assumptions.",
    upstream_datasets: ["GDP by Industry, current-dollar value added by industry"],
    storage_layers: ["postgres.sector_gdp_snapshots"],
  },
  {
    id: "labor.cpi-heatmap",
    methodology_type: "source_backed",
    freshness_cadence: "annual",
    methodology_note_required: false,
    source_claim_template: "Source: BLS CPI Relative Importance · Dec <year>",
    upstream_datasets: ["Consumer Price Index Relative Importance tables, U.S. city average, major groups"],
    storage_layers: ["postgres.cpi_category_snapshots"],
  },
  {
    id: "labor.state-scatter",
    methodology_type: "derived",
    freshness_cadence: "annual",
    methodology_note_required: true,
    source_claim_template: "Source: BLS, BEA, Census · <year>",
    transformation_summary:
      "Compute GDP per capita as annual current-dollar GDP by state divided by the matching annual Census population estimate, while keeping unemployment as the same-year annual average rate for a curated state universe.",
    upstream_datasets: [
      "Local Area Unemployment Statistics annual average unemployment rate by state",
      "Annual current-dollar GDP by state",
      "Annual state population estimates",
    ],
    storage_layers: ["postgres.state_indicator_snapshots"],
  },
  {
    id: "markets.sector-treemap",
    methodology_type: "derived",
    freshness_cadence: "quarterly",
    methodology_note_required: true,
    source_claim_template: "Source: BEA GDP by Industry · Q<quarter> <year>",
    transformation_summary:
      "Map official BEA current-dollar value-added industries into one shared sector hierarchy used by both the treemap and waffle without introducing handcrafted percentage assumptions.",
    upstream_datasets: ["GDP by Industry, current-dollar value added by industry"],
    storage_layers: ["postgres.sector_gdp_snapshots"],
  },
  {
    id: "markets.gdp-waffle",
    methodology_type: "derived",
    freshness_cadence: "quarterly",
    methodology_note_required: true,
    source_claim_template: "Source: BEA GDP by Industry · Q<quarter> <year>",
    transformation_summary:
      "Map official BEA current-dollar value-added industries into one shared sector hierarchy used by both the treemap and waffle without introducing handcrafted percentage assumptions.",
    upstream_datasets: ["GDP by Industry, current-dollar value added by industry"],
    storage_layers: ["postgres.sector_gdp_snapshots"],
  },
];

const PHASE_3_TARGET_EXPECTATIONS: Phase3TargetExpectation[] = [
  {
    id: "overview.gdp-waterfall",
    methodology_type: "source_backed",
    freshness_cadence: "quarterly",
    methodology_note_required: false,
    source_claim_template: "Source: BEA Contributions to Real GDP Growth · Q<quarter> <year>",
    upstream_datasets: ["NIPA Table 1.1.2 Contributions to Percent Change in Real Gross Domestic Product"],
    storage_layers: ["postgres.economic_series", "postgres.series_metadata"],
  },
  {
    id: "overview.economic-funnel",
    methodology_type: "derived",
    freshness_cadence: "mixed",
    methodology_note_required: true,
    source_claim_template: "Source: BEA, BLS · <latest aligned period>",
    transformation_summary:
      "Build the funnel from stored GDP, gross national income, compensation, and employment inputs with documented unit conversions and stage mapping rather than fixed share assumptions.",
    upstream_datasets: [
      "Gross Domestic Product; Gross National Income; Compensation of employees",
      "Employment series used for the workforce stage",
    ],
    storage_layers: ["postgres.economic_series", "postgres.series_metadata", "backend_service"],
  },
  {
    id: "overview.bullet-targets",
    methodology_type: "derived",
    freshness_cadence: "mixed",
    methodology_note_required: true,
    source_claim_template: "Source: BEA, BLS, Federal Reserve · <latest aligned period>",
    transformation_summary:
      "Compute KPI measures from stored GDP, CPIAUCSL, UNRATE, and FEDFUNDS series, then attach backend-owned target bands and markers through the shared KPI contract rather than a frontend-only threshold map.",
    upstream_datasets: ["GDP, CPIAUCSL, UNRATE, FEDFUNDS"],
    storage_layers: ["postgres.economic_series", "postgres.series_metadata", "backend_service"],
  },
  {
    id: "labor.economic-funnel",
    methodology_type: "derived",
    freshness_cadence: "mixed",
    methodology_note_required: true,
    source_claim_template: "Source: BEA, BLS · <latest aligned period>",
    transformation_summary:
      "Build the funnel from stored GDP, gross national income, compensation, and employment inputs with documented unit conversions and stage mapping rather than fixed share assumptions.",
    upstream_datasets: [
      "Gross Domestic Product; Gross National Income; Compensation of employees",
      "Employment series used for the workforce stage",
    ],
    storage_layers: ["postgres.economic_series", "postgres.series_metadata", "backend_service"],
  },
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

function validateUpstreamSources(
  upstreamSources: ManifestUpstreamSource[],
  chartId: string,
  allowedSourceKinds: Set<UpstreamSourceKind>,
  fieldName = "upstream_sources",
) {
  if (!Array.isArray(upstreamSources) || upstreamSources.length === 0) {
    throw new Error(`${chartId}: ${fieldName} must contain at least one entry`);
  }

  for (const source of upstreamSources) {
    expectNonEmptyString(source.provider, `${fieldName}.provider`, chartId);
    expectNonEmptyString(source.dataset, `${fieldName}.dataset`, chartId);
    if (!allowedSourceKinds.has(source.kind)) {
      throw new Error(`${chartId}: invalid ${fieldName} kind`);
    }
  }
}

function validateStorageLocations(
  storageLocations: ManifestStorageLocation[],
  chartId: string,
  fieldName = "storage_locations",
) {
  if (!Array.isArray(storageLocations) || storageLocations.length === 0) {
    throw new Error(`${chartId}: ${fieldName} must contain at least one entry`);
  }

  for (const location of storageLocations) {
    expectNonEmptyString(location.layer, `${fieldName}.layer`, chartId);
    expectNonEmptyString(location.reference, `${fieldName}.reference`, chartId);
  }
}

function validatePhase2TargetContract(
  chart: ManifestChartEntry,
  allowedSourceKinds: Set<UpstreamSourceKind>,
) {
  const contract = chart.phase_2_target_contract;
  if (!contract) {
    throw new Error(`${chart.id}: phase_2_target_contract is required for approved phase 2 replacement charts`);
  }

  if (contract.public !== true) {
    throw new Error(`${chart.id}: phase_2_target_contract public must be true`);
  }

  if (!["source_backed", "derived"].includes(contract.methodology_type)) {
    throw new Error(`${chart.id}: invalid phase_2_target_contract methodology type`);
  }

  if (typeof contract.methodology_note_required !== "boolean") {
    throw new Error(`${chart.id}: phase_2_target_contract methodology_note_required must be boolean`);
  }

  expectNonEmptyString(contract.freshness_cadence, "phase_2_target_contract.freshness_cadence", chart.id);
  expectNonEmptyString(contract.source_claim_template, "phase_2_target_contract.source_claim_template", chart.id);

  validateUpstreamSources(
    contract.upstream_sources,
    chart.id,
    allowedSourceKinds,
    "phase_2_target_contract.upstream_sources",
  );
  validateStorageLocations(
    contract.storage_locations,
    chart.id,
    "phase_2_target_contract.storage_locations",
  );

  if (contract.methodology_type === "derived") {
    if (!contract.methodology_note_required) {
      throw new Error(`${chart.id}: derived phase_2_target_contract charts must require methodology notes`);
    }
    expectNonEmptyString(
      contract.transformation_summary,
      "phase_2_target_contract.transformation_summary",
      chart.id,
    );
  }
}

function validatePhase3TargetContract(
  chart: ManifestChartEntry,
  allowedSourceKinds: Set<UpstreamSourceKind>,
) {
  const contract = chart.phase_3_target_contract;
  if (!contract) {
    throw new Error(`${chart.id}: phase_3_target_contract is required for approved phase 3 methodology charts`);
  }

  if (contract.public !== true) {
    throw new Error(`${chart.id}: phase_3_target_contract public must be true`);
  }

  if (!["source_backed", "derived"].includes(contract.methodology_type)) {
    throw new Error(`${chart.id}: invalid phase_3_target_contract methodology type`);
  }

  if (typeof contract.methodology_note_required !== "boolean") {
    throw new Error(`${chart.id}: phase_3_target_contract methodology_note_required must be boolean`);
  }

  expectNonEmptyString(contract.freshness_cadence, "phase_3_target_contract.freshness_cadence", chart.id);
  expectNonEmptyString(contract.source_claim_template, "phase_3_target_contract.source_claim_template", chart.id);

  validateUpstreamSources(
    contract.upstream_sources,
    chart.id,
    allowedSourceKinds,
    "phase_3_target_contract.upstream_sources",
  );
  validateStorageLocations(
    contract.storage_locations,
    chart.id,
    "phase_3_target_contract.storage_locations",
  );

  if (contract.methodology_type === "derived") {
    if (!contract.methodology_note_required) {
      throw new Error(`${chart.id}: derived phase_3_target_contract charts must require methodology notes`);
    }
    expectNonEmptyString(
      contract.transformation_summary,
      "phase_3_target_contract.transformation_summary",
      chart.id,
    );
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
  const allowedSourceKinds = new Set<UpstreamSourceKind>([
    "stored_series",
    "stored_snapshot",
    "live_api_fallback",
    "inline_approximation",
    "frontend_assumption",
  ]);
  const expectedPhase2ContractIds = new Set(PHASE_2_TARGET_EXPECTATIONS.map(({ id }) => id));
  const expectedPhase3ContractIds = new Set(PHASE_3_TARGET_EXPECTATIONS.map(({ id }) => id));

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

    validateUpstreamSources(chart.upstream_sources, chart.id, allowedSourceKinds);
    validateStorageLocations(chart.storage_locations, chart.id);

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

    if (expectedPhase2ContractIds.has(chart.id)) {
      validatePhase2TargetContract(chart, allowedSourceKinds);
    } else if (chart.phase_2_target_contract) {
      throw new Error(`${chart.id}: unexpected phase_2_target_contract`);
    }

    if (expectedPhase3ContractIds.has(chart.id)) {
      validatePhase3TargetContract(chart, allowedSourceKinds);
    } else if (chart.phase_3_target_contract) {
      throw new Error(`${chart.id}: unexpected phase_3_target_contract`);
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
  const phase2TargetContract = ((schema.$defs as Record<string, unknown>)?.phase2TargetContract ?? {}) as Record<
    string,
    unknown
  >;
  const upstreamSource = ((schema.$defs as Record<string, unknown>)?.upstreamSource ?? {}) as Record<string, unknown>;

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
    expect((upstreamSource.properties as { kind?: { enum?: string[] } }).kind?.enum).toEqual([
      "stored_series",
      "stored_snapshot",
      "live_api_fallback",
      "inline_approximation",
      "frontend_assumption",
    ]);
    expect(chartEntryProperties.phase_2_target_contract).toEqual({
      $ref: "#/$defs/phase2TargetContract",
    });
    expect(chartEntryProperties.phase_3_target_contract).toEqual({
      $ref: "#/$defs/phase2TargetContract",
    });
    expect((phase2TargetContract.required as string[])).toEqual(
      expect.arrayContaining([
        "public",
        "methodology_type",
        "freshness_cadence",
        "methodology_note_required",
        "source_claim_template",
        "upstream_sources",
        "storage_locations",
      ]),
    );

    const illustrativePolicy = chartEntryAllOf.find(
      (rule) => (rule.if as { properties?: { methodology_type?: { const?: string } } })?.properties?.methodology_type?.const === "illustrative",
    );
    const derivedPolicy = chartEntryAllOf.find(
      (rule) => (rule.if as { properties?: { methodology_type?: { const?: string } } })?.properties?.methodology_type?.const === "derived",
    );
    const phase2Policy = chartEntryAllOf.find(
      (rule) => (rule.if as { properties?: { remediation_status?: { const?: string } } })?.properties?.remediation_status?.const === "phase_2_replace_or_hide",
    );
    const phase2DerivedPolicy = ((phase2TargetContract.allOf as Array<Record<string, unknown>> | undefined) ?? []).find(
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
    expect((phase2Policy?.then as { required?: string[] })?.required).toEqual(
      expect.arrayContaining(["phase_2_target_contract"]),
    );
    expect((phase2DerivedPolicy?.then as { required?: string[] })?.required).toEqual(
      expect.arrayContaining(["transformation_summary"]),
    );
  });

  it("validates the manifest against runtime chart expectations", () => {
    expect(() => validateManifest(manifest)).not.toThrow();
    expect(manifest.charts).toHaveLength(CHART_RUNTIME_EXPECTATIONS.length);
  });

  it("captures approved phase 2 target contracts for every replacement chart", () => {
    const byId = new Map(manifest.charts.map((chart) => [chart.id, chart] as const));

    expect(
      manifest.charts
        .filter((chart) => "phase_2_target_contract" in chart)
        .map(({ id }) => id)
        .sort(),
    ).toEqual(PHASE_2_TARGET_EXPECTATIONS.map(({ id }) => id).sort());

    for (const expectation of PHASE_2_TARGET_EXPECTATIONS) {
      const chart = byId.get(expectation.id);
      if (!chart?.phase_2_target_contract) {
        throw new Error(`${expectation.id} missing phase_2_target_contract`);
      }

      expect(chart.phase_2_target_contract.public).toBe(true);
      expect(chart.phase_2_target_contract.methodology_type).toBe(expectation.methodology_type);
      expect(chart.phase_2_target_contract.freshness_cadence).toBe(expectation.freshness_cadence);
      expect(chart.phase_2_target_contract.methodology_note_required).toBe(expectation.methodology_note_required);
      expect(chart.phase_2_target_contract.source_claim_template).toBe(expectation.source_claim_template);
      expect(chart.phase_2_target_contract.transformation_summary).toBe(expectation.transformation_summary);
      expect(chart.phase_2_target_contract.upstream_sources.map(({ dataset }) => dataset)).toEqual(
        expectation.upstream_datasets,
      );
      expect(chart.phase_2_target_contract.storage_locations.map(({ layer }) => layer)).toEqual(
        expectation.storage_layers,
      );
    }
  });

  it("captures approved phase 3 target contracts for every unresolved methodology chart", () => {
    const byId = new Map(manifest.charts.map((chart) => [chart.id, chart] as const));

    expect(
      manifest.charts
        .filter((chart) => "phase_3_target_contract" in chart)
        .map(({ id }) => id)
        .sort(),
    ).toEqual(PHASE_3_TARGET_EXPECTATIONS.map(({ id }) => id).sort());

    for (const expectation of PHASE_3_TARGET_EXPECTATIONS) {
      const chart = byId.get(expectation.id);
      if (!chart?.phase_3_target_contract) {
        throw new Error(`${expectation.id} missing phase_3_target_contract`);
      }

      expect(chart.phase_3_target_contract.public).toBe(true);
      expect(chart.phase_3_target_contract.methodology_type).toBe(expectation.methodology_type);
      expect(chart.phase_3_target_contract.freshness_cadence).toBe(expectation.freshness_cadence);
      expect(chart.phase_3_target_contract.methodology_note_required).toBe(expectation.methodology_note_required);
      expect(chart.phase_3_target_contract.source_claim_template).toBe(expectation.source_claim_template);
      expect(chart.phase_3_target_contract.transformation_summary).toBe(expectation.transformation_summary);
      expect(chart.phase_3_target_contract.upstream_sources.map(({ dataset }) => dataset)).toEqual(
        expectation.upstream_datasets,
      );
      expect(chart.phase_3_target_contract.storage_locations.map(({ layer }) => layer)).toEqual(
        expectation.storage_layers,
      );
    }
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

  it("fails validation when a phase 2 chart loses its target contract", () => {
    const nextManifest = cloneManifest(manifest);
    const chart = nextManifest.charts.find(({ id }) => id === "labor.state-scatter");
    if (!chart) {
      throw new Error("labor.state-scatter missing from fixture manifest");
    }

    delete chart.phase_2_target_contract;

    expect(() => validateManifest(nextManifest)).toThrow(
      "labor.state-scatter: phase_2_target_contract is required for approved phase 2 replacement charts",
    );
  });

  it("fails validation when a derived phase 2 contract omits its deterministic transformation", () => {
    const nextManifest = cloneManifest(manifest);
    const chart = nextManifest.charts.find(({ id }) => id === "markets.sector-treemap");
    if (!chart?.phase_2_target_contract) {
      throw new Error("markets.sector-treemap missing from fixture manifest");
    }

    chart.phase_2_target_contract.methodology_note_required = false;
    delete chart.phase_2_target_contract.transformation_summary;

    expect(() => validateManifest(nextManifest)).toThrow(
      "markets.sector-treemap: derived phase_2_target_contract charts must require methodology notes",
    );
  });

  it("fails validation when an approved phase 3 chart loses its target contract", () => {
    const nextManifest = cloneManifest(manifest);
    const chart = nextManifest.charts.find(({ id }) => id === "overview.gdp-waterfall");
    if (!chart) {
      throw new Error("overview.gdp-waterfall missing from fixture manifest");
    }

    delete chart.phase_3_target_contract;

    expect(() => validateManifest(nextManifest)).toThrow(
      "overview.gdp-waterfall: phase_3_target_contract is required for approved phase 3 methodology charts",
    );
  });

  it("fails validation when a derived phase 3 contract omits its deterministic transformation", () => {
    const nextManifest = cloneManifest(manifest);
    const chart = nextManifest.charts.find(({ id }) => id === "overview.economic-funnel");
    if (!chart?.phase_3_target_contract) {
      throw new Error("overview.economic-funnel missing phase_3_target_contract");
    }

    chart.phase_3_target_contract.methodology_note_required = false;
    delete chart.phase_3_target_contract.transformation_summary;

    expect(() => validateManifest(nextManifest)).toThrow(
      "overview.economic-funnel: derived phase_3_target_contract charts must require methodology notes",
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
