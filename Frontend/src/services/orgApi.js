// src/services/orgApi.js
export const endpoints = {
	businessUnits: "/api/business-units",
	salesChannels: "/api/sales-channels",
	salesOffices: "/api/sales-offices",
	salesTeams: "/api/sales-teams",
	marketingChannels: "/api/marketing-channels",
	marketingOffices: "/api/marketing-offices",
	marketingTeams: "/api/marketing-teams",
	serviceChannels: "/api/service-channels",
	serviceOffices: "/api/service-offices",
	serviceTeams: "/api/service-teams",
};

/**
 * Fetch one endpoint (rootUrl must be like "http://localhost:4005")
 */
export async function fetchEndpoint(rootUrl, path, signal) {
	const url = `${rootUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
	const res = await fetch(url, { signal });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}