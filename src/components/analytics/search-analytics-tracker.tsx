"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics-client";

type SearchAnalyticsTrackerProps = {
  resultCount: number;
  searchTerm: string;
};

export function SearchAnalyticsTracker({
  resultCount,
  searchTerm
}: SearchAnalyticsTrackerProps) {
  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    trackAnalyticsEvent({
      type: "SEARCH",
      searchTerm,
      resultsCount: resultCount
    });

    if (resultCount === 0) {
      trackAnalyticsEvent({
        type: "SEARCH_NO_RESULTS",
        searchTerm,
        resultsCount: resultCount
      });
    }
  }, [resultCount, searchTerm]);

  return null;
}