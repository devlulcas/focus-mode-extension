import React from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";

export function Providers({ children }: { children: React.ReactNode }) {
  useSyncBlockedWebsites();
  useSyncEnabled();

  return <>{children}</>;
}
