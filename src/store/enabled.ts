import { useEffect, useRef, useState } from "react";
import {
  getEnabled,
  listenToEnabledStorageChanges,
} from "../model/enabled-storage.js";

export function useSyncEnabled() {
  const [state, setState] = useState(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current === false) {
      return;
    }

    const init = async () => {
      const result = await getEnabled();
      setState(result);
      firstLoad.current = false;
    };

    init();

    return () => {
      firstLoad.current = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = listenToEnabledStorageChanges((enabled) => {
      setState(enabled);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
