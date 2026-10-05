import { appStore } from "@/lib/state/app-store";
import { getBrowserStorage } from "@/lib/state/storage";
import { createSyncEngine } from "./engine";
import { loadToken } from "./meta";
import { createHttpTransport } from "./transport";

const storage = getBrowserStorage();

/**
 * The app-wide sync engine. It does nothing until `start()` is called (from a client component) and
 * stays idle unless this device holds a sync token and the server has sync configured.
 */
export const appSyncEngine = createSyncEngine({
  store: appStore,
  storage,
  transport: createHttpTransport({ getToken: () => loadToken(storage) }),
});
