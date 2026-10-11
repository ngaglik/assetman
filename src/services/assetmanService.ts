import { Config, API_BASE } from "@/constant/config";
import { apiFetch } from "./apiClient";
import type { SelectOption } from "@/types/ui";

export interface PagedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  inputSearch?: string;
  filters?: Record<string, string | number | null | undefined>;
}

const url = (path: string) => `${Config.UrlBackend}${API_BASE}${path}`;

async function parse<T>(response: Response | undefined): Promise<T> {
  if (!response) throw new Error("Sesi berakhir, silakan login kembali.");
  if (!response.ok) {
    let message = `Permintaan gagal (${response.status})`;
    try {
      const err = await response.json();
      message = err?.message ?? message;
    } catch {
      /* respons tanpa body JSON */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function listResource<T = any>(
  endpoint: string,
  params: ListParams = {},
): Promise<PagedResult<T>> {
  const q = new URLSearchParams();
  q.append("page", String(params.page ?? 1));
  q.append("pageSize", String(params.pageSize ?? 20));
  q.append("inputSearch", params.inputSearch ?? "");
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== null && value !== undefined && value !== "") {
        q.append(key, String(value));
      }
    }
  }
  const res = await apiFetch(`${url(endpoint)}?${q.toString()}`, { method: "GET" });
  return parse<PagedResult<T>>(res);
}

export async function getResource<T = any>(
  endpoint: string,
  id: string | number,
): Promise<T> {
  const res = await apiFetch(url(`${endpoint}/${id}`), { method: "GET" });
  return parse<T>(res);
}

export interface HistoryEntry {
  type: string | null;
  date: string | null;
  code: string | null;
  qty?: number | null;
  organization_name?: string | null;
  location_name?: string | null;
  to_organization_name?: string | null;
  to_location_name?: string | null;
  source_name?: string | null;
  kondisi_name?: string | null;
  asset_code?: string | null;
  nup?: string | null;
  barcode?: string | null;
  pegawai?: string | null;
  method?: string | null;
  value?: number | null;
  status?: string | null;
  reporter?: string | null;
  handling_description?: string | null;
  condition_before?: string | null;
  condition_after?: string | null;
  notes?: string | null;
}

/**
 * Riwayat berdasarkan nomor aset (kode aset): gabungan penambahan, pemindahan,
 * dan penghapusan untuk aset tersebut.
 */
export async function loadAssetHistory(
  assetCode: string,
): Promise<HistoryEntry[]> {
  const res = await apiFetch(url(`/history/${encodeURIComponent(assetCode)}`), {
    method: "GET",
  });
  return parse<HistoryEntry[]>(res);
}

export async function createResource<T = any>(
  endpoint: string,
  payload: any,
): Promise<T> {
  const res = await apiFetch(url(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<T>(res);
}

export async function updateResource<T = any>(
  endpoint: string,
  id: string | number,
  payload: any,
): Promise<T> {
  const res = await apiFetch(url(`${endpoint}/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<T>(res);
}

export async function deleteResource<T = any>(
  endpoint: string,
  id: string | number,
): Promise<T> {
  const res = await apiFetch(url(`${endpoint}/${id}`), { method: "DELETE" });
  return parse<T>(res);
}

/** Ubah status workflow sebuah record (mis. draft -> submitted -> approved). */
export async function updateStatus(
  resource: string,
  id: string | number,
  payload: { status: string; approved_by?: string | null },
): Promise<any> {
  const res = await apiFetch(url(`/${resource}/${id}/status`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

async function fetchOptions(path: string): Promise<SelectOption[]> {
  const res = await apiFetch(url(`/option/${path}`), { method: "GET" });
  return parse<SelectOption[]>(res);
}

export const loadOrganizations = () => fetchOptions("organizations");
export const loadLocations = () => fetchOptions("locations");
export const loadItems = () => fetchOptions("items");
export const loadItemNames = () => fetchOptions("item-names");
export const loadDistinctItems = () => fetchOptions("items?distinct=1");
export const loadCategories = () => fetchOptions("categories");
export const loadUnits = () => fetchOptions("units");
export const loadSources = () => fetchOptions("sources");
export const loadConditions = () => fetchOptions("conditions");
export const loadHandlingStatuses = () => fetchOptions("handling-statuses");

/** Opsi status penanganan dengan nilai = kode status (mis. "STP-0002"). */
export const loadHandlingStatusOptions = async (): Promise<SelectOption[]> => {
  const list = await fetchOptions("handling-statuses");
  return list.map((s) => ({ label: s.label, value: s.code ?? s.label }));
};

/** Opsi kondisi dengan nilai = nama kondisi (untuk field berisi teks). */
export const loadConditionNames = async (): Promise<SelectOption[]> => {
  const list = await fetchOptions("conditions");
  return list.map((c) => ({ label: c.label, value: c.label }));
};

/** Pencarian aset berdasarkan barcode (untuk pemindahan). Minimal 2 karakter. */
export async function searchAssetsByBarcode(
  query: string,
): Promise<SelectOption[]> {
  const res = await apiFetch(
    url(`/option/assets?q=${encodeURIComponent(query.trim())}`),
    { method: "GET" },
  );
  return parse<SelectOption[]>(res);
}

/**
 * Pencarian barang (nama/kode) untuk dropdown. Minimal 2 karakter.
 * Bila organisasi/lokasi diisi, hasil dibatasi pada barang yang ada di sana.
 */
export async function searchItems(
  query: string,
  organizationId?: string | null,
  locationId?: string | null,
): Promise<SelectOption[]> {
  const params = new URLSearchParams();
  params.append("q", query.trim());
  if (organizationId) params.append("organization_id", String(organizationId));
  if (locationId) params.append("location_id", String(locationId));
  const res = await apiFetch(url(`/option/items?${params.toString()}`), {
    method: "GET",
  });
  return parse<SelectOption[]>(res);
}

/**
 * Pencarian pegawai (nama) untuk dropdown AssetMan.
 * Memakai endpoint modul `/api/setman/option/employees?q=...` (minimal 2 karakter).
 */
export async function searchEmployees(query: string): Promise<SelectOption[]> {
  const res = await apiFetch(
    url(`/option/employees?q=${encodeURIComponent(query.trim())}`),
    { method: "GET" },
  );
  return parse<SelectOption[]>(res);
}

export interface DashboardSummary {
  total_items: number;
  total_addition: number;
  total_maintenance: number;
  total_transfer: number;
  total_disposal: number;
}

export async function fetchDashboardSummary(
  year?: number,
): Promise<DashboardSummary> {
  const q = year ? `?year=${year}` : "";
  const res = await apiFetch(url(`/dashboard/summary${q}`), { method: "GET" });
  return parse<DashboardSummary>(res);
}

export interface BreakdownItem {
  label: string | null;
  qty: number;
  count: number;
}

export interface DashboardBreakdown {
  by_item: BreakdownItem[];
  by_brand: BreakdownItem[];
  by_tipe: BreakdownItem[];
  by_source: BreakdownItem[];
}

export async function fetchDashboardBreakdown(
  year?: number,
  organizationId?: string | null,
  locationId?: string | null,
): Promise<DashboardBreakdown> {
  const params = new URLSearchParams();
  if (year) params.append("year", String(year));
  if (organizationId) params.append("organization_id", organizationId);
  if (locationId) params.append("location_id", locationId);
  const qs = params.toString();
  const res = await apiFetch(url(`/dashboard/breakdown${qs ? `?${qs}` : ""}`), {
    method: "GET",
  });
  return parse<DashboardBreakdown>(res);
}
