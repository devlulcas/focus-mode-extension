import { useStore } from "@nanostores/react";
import React from "react";
import type { Website } from "../model/website.js";
import {
  $blockedWebsitesAtom,
  cleanupBlockedWebsites,
  removeFromBlockedWebsites,
} from "../store/blocked-websites.js";

function BlockWebsiteListItem({ website }: { website: Website }) {
  return (
    <li>
      <img src={website.favicon} alt={website.title} />
      <h3>{website.title}</h3>
      <p>{website.domain}</p>
      <button onClick={() => removeFromBlockedWebsites(website.domain)}>
        Remove
      </button>
    </li>
  );
}

export function BlockWebsiteList() {
  const blockedWebsites = useStore($blockedWebsitesAtom);

  console.log("blockedWebsites", blockedWebsites);

  return (
    <ul>
      <li>
        <button onClick={() => cleanupBlockedWebsites()}>Cleanup</button>
      </li>
      {blockedWebsites.map((website) => (
        <BlockWebsiteListItem key={website.domain} website={website} />
      ))}
    </ul>
  );
}
