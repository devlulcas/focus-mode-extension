import React from "react";
import type { Website } from "../model/website.js";
import {
  deleteBlockedWebsite,
  toggleBlockedWebsite,
  useSyncBlockedWebsites,
} from "../store/blocked-websites.js";

function BlockWebsiteListItem({ website }: { website: Website }) {
  return (
    <li>
      <img src={website.favicon} alt={website.title} />
      <h3>{website.title}</h3>
      <p>{website.domain}</p>

      <button onClick={async () => await toggleBlockedWebsite(website.domain)}>
        {website.blocked ? "Unblock" : "Block"}
      </button>

      <button onClick={async () => await deleteBlockedWebsite(website.domain)}>
        Delete
      </button>
    </li>
  );
}

export function BlockWebsiteList() {
  const blockedWebsites = useSyncBlockedWebsites();

  return (
    <div>
      <ul>
        {blockedWebsites.map((website) => (
          <BlockWebsiteListItem key={website.domain} website={website} />
        ))}
      </ul>
    </div>
  );
}
