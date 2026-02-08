// src/hooks/useOrgDepartments.js
import { useCallback, useEffect, useState } from "react";
import { endpoints, fetchEndpoint } from "../services/orgApi";
import { toast } from "react-toastify";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

/**
 * useOrgDepartments
 * @param {object} opts { rootUrl: string, token?: string }
 */
export default function useOrgDepartments({ rootUrl = `${BASE_URL_MS}`, token } = {}) {
	const [departments, setDepartments] = useState([]); // flattened array
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const normalize = (items = [], type = "unknown") => {
		// helper: return first present key value
		const pick = (obj, keys = []) => {
			if (!obj || typeof obj !== "object") return undefined;
			for (const k of keys) {
				if (obj[k] !== undefined && obj[k] !== null) return obj[k];
			}
			return undefined;
		};

		// canonical field candidate lists by endpoint/type
		const ID_CANDIDATES = [
			"businessUnitCode",
			"salesChannelCode",
			"salesOfficeId",
			"salesTeamCode",
			"marketingChannelCode",
			"marketingOfficeId",
			"marketingTeamCode",
			"serviceChannelCode",
			"serviceOfficeId",
			"serviceTeamCode",
		];

		const NAME_CANDIDATES = [
			"businessUnitName",
			"salesChannelName",
			"organizationName",
			"salesTeamName",
			"marketingChannelName",
			"marketingTeamName",
			"serviceChannelName",
			"serviceTeamName",
		];

		return (Array.isArray(items) ? items : []).map((it, idx) => {
			// primitive (string/number) -> shallow normalize
			if (typeof it === "string" || typeof it === "number") {
				const s = String(it);
				return { id: s, name: s, type, raw: it };
			}

			// Defensive: if API wrapped data e.g. { data: [...] } accidentally passed in
			if (it && Array.isArray(it.data)) {
				// If this happens, return a placeholder entry so caller can inspect
				return {
					id: `${type}-wrapped-${idx}`,
					name: `${type} (wrapped)`,
					type,
					raw: it,
				};
			}

			// pick id & name from many possible fields
			let id = pick(it, ID_CANDIDATES);
			let name = pick(it, NAME_CANDIDATES);

			// Some endpoints use different keys per your Prisma schema:
			// e.g. BusinessUnit -> businessUnitCode / businessUnitDesc
			// SalesOffice -> salesOfficeId / organizationName
			// fallback attempts:
			id = id ?? it?.id ?? it?.ID ?? it?.salesOfficeId ?? it?.businessUnitCode;
			name = name ?? it?.name ?? it?.displayName ?? it?.organizationName ?? it?.businessUnitDesc;

			// Last-resort fallback values
			const fallbackId = `unknown-${type}-${idx}`;
			const finalId = id == null ? fallbackId : id;
			const finalName = name == null ? String(finalId) : name;

			return {
				id: String(finalId),
				name: String(finalName),
				type,
				raw: it,
			};
		});
	};

	const load = useCallback(async (signal) => {
		setLoading(true);
		setError(null);

		try {
			// Prepare parallel fetches
			const fetches = Object.entries(endpoints).map(([key, path]) =>
				fetchEndpoint(rootUrl, path, signal)
					.then((data) => ({ key, data }))
					.catch((err) => {
						// non-fatal: return empty array and log; optionally throw to stop all
						console.warn(`Failed to fetch ${key}`, err);
						return { key, data: [] };
					})
			);

			const results = await Promise.all(fetches);

			// flatten & normalize
			const flat = results.flatMap(({ key, data }) => normalize(data, key));
			setDepartments(flat);
		} catch (err) {
			if (err.name !== "AbortError") {
				setError(err);
				toast.error("Unable to load organizational units");
				console.error(err);
			}
		} finally {
			setLoading(false);
		}
	}, [rootUrl]);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	const refresh = useCallback(() => {
		const controller = new AbortController();
		load(controller.signal);
	}, [load]);

	return { departments, loading, error, refresh };
}