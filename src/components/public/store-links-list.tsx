/* eslint-disable @next/next/no-img-element */
"use client";

import { trackAnalyticsEvent } from "@/lib/analytics-client";

type StoreLinksListProps = {
  links: Array<{
    id: string;
    title: string;
    description: string;
    redirectUrl: string;
    imageUrl: string | null;
  }>;
};

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function StoreLinksList({ links }: StoreLinksListProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      {links.map((link) => (
        <a
          className="group flex min-h-20 w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          href={link.redirectUrl}
          key={link.id}
          onClick={() =>
            trackAnalyticsEvent({
              linkId: link.id,
              type: "LINK_CLICK"
            })
          }
          rel={isExternalUrl(link.redirectUrl) ? "noreferrer" : undefined}
        >
          {link.imageUrl ? (
            <img
              alt=""
              className="size-12 shrink-0 rounded-md object-cover"
              src={link.imageUrl}
            />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-base font-semibold text-muted-foreground transition-colors group-hover:bg-background">
              {link.title.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1 text-left">
            <span className="block font-semibold leading-5">{link.title}</span>
            {link.description ? (
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                {link.description}
              </span>
            ) : null}
          </span>
          <span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      ))}
    </div>
  );
}