export function normalizeAnalyticsPagePath(pagePath: string) {
  try {
    return new URL(pagePath, "http://localhost").pathname;
  } catch {
    return pagePath.split("?")[0] || pagePath;
  }
}
