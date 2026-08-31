import { Hono } from "hono";
import { METRIC_SOURCES, METRIC_SOURCE_LABELS } from "../../src/types";
import { env } from "../config/env";

/**
 * What each upstream read actually is. Statuses and latencies are deliberately
 * absent: inventing "degraded, 230ms" would be exactly the sample figure this
 * project exists to avoid. Whether a source is reachable is only knowable by
 * reading it, which the rankings route does.
 */
const READ_METHODS: Record<string, string> = {
  anilist: "GraphQL character favourites",
  mal: "top-characters board favourites",
  ao3: "works under the canonical character tag",
  danbooru: "posts under the character tag",
};

const app = new Hono();

const SOURCE_NAMES: Record<string, string> = {
  anilist: "AniList",
  mal: "MyAnimeList",
  ao3: "AO3",
  danbooru: "Danbooru",
};

app.get("/", (c) => {
  return c.json({
    services: METRIC_SOURCES.map((source) => ({
      id: source,
      name: SOURCE_NAMES[source] ?? source,
      method: READ_METHODS[source] ?? "unknown",
      authenticated: source === "danbooru" ? Boolean(env.danbooruToken) : false,
    })),
    sources: [...METRIC_SOURCES],
    updated_at: new Date().toISOString(),
  });
});

export default app;
