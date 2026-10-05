import { STORAGE_KEY, getBrowserStorage } from "./storage";
import { createStore } from "./store";

/**
 * The app-wide store. On the server `getBrowserStorage()` is null, so it never reads or writes anything there;
 * in the browser it loads saved progress once, when this module first loads.
 */
export const appStore = createStore({ storage: getBrowserStorage() });

// Keep several open tabs in sync: another tab wrote to (or cleared) localStorage.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) appStore.reloadFromStorage();
  });
}
