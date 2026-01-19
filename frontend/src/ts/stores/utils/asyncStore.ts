import { createSignal, createResource, createEffect } from "solid-js";
import { createStore, Store } from "solid-js/store";
import type { Accessor } from "solid-js";
import { promiseWithResolvers } from "../../utils/misc";

export type LoadError = Error | { message?: string };
type State =
  | {
      state: "unresolved";
      loading: false;
      ready: false;
      refreshing: false;
      error?: undefined;
    }
  | {
      state: "pending";
      loading: true;
      ready: false;
      refreshing: false;
      error?: undefined;
    }
  | {
      state: "ready";
      loading: false;
      ready: true;
      refreshing: false;
      error?: undefined;
    }
  | {
      state: "refreshing";
      loading: true;
      ready: true;
      refreshing: true;
      error?: undefined;
    }
  | {
      state: "errored";
      loading: false;
      ready: false;
      refreshing: false;
      error: LoadError;
    };

export type AsyncStore<T> = {
  /**
   * request store to be loaded
   */
  load: () => void;

  /**
   * request store to be refreshed
   */
  refresh: () => void;

  /**
   * reset the resource +  store
   */
  reset: () => void;

  /**
   * store state
   */
  state: Accessor<State>;

  /**
   * the data store
   */
  store: Store<T>;

  /**
   * promise that resolves when the store is ready.
   * rejects if shouldLoad is false
   */
  ready: () => Promise<T>;
};

export function createAsyncStore<T extends object>(
  name: string,
  fetcher: () => Promise<T>,
  initialValue: () => T,
  options?: { autoLoad?: true },
): AsyncStore<T> {
  console.debug(`AsyncStore ${name}: created`);
  const [shouldLoad, setShouldLoad] = createSignal(options?.autoLoad ?? false);
  const [getState, setState] = createSignal<State>({
    state: "unresolved",
    loading: false,
    ready: false,
    refreshing: false,
    error: undefined,
  });

  const [res, { refetch }] = createResource(shouldLoad, async (load) => {
    if (!load) return undefined as unknown as T;
    return fetcher();
  });

  const [store, setStore] = createStore<T>(initialValue());
  let ready = promiseWithResolvers<T>();

  const updateState = (state: State["state"], error?: LoadError): void => {
    console.debug(`AsyncStore ${name}: update state to ${state}`);
    setState({
      state,
      loading: state === "pending",
      ready: state === "ready",
      refreshing: state === "refreshing",
      error: error,
    } as State);
  };

  createEffect(() => {
    if (res.error !== undefined) {
      ready.reject(res.error);
      updateState(res.state, res.error as LoadError);
      return;
    }

    const data = res();
    if (data) {
      updateState(res.state);
      setStore(data);
      ready.resolve(data);
    }
  });

  createEffect(() => {
    if (!shouldLoad()) {
      updateState("unresolved");
      return;
    }
    updateState("pending");
  });

  const load = (): void => {
    if (!shouldLoad()) setShouldLoad(true);
  };
  const refresh = (): void => {
    if (!shouldLoad()) {
      setShouldLoad(true);
    }
    ready.reset();
    updateState("refreshing");
    void refetch();
  };

  const reset = (): void => {
    setShouldLoad(false);

    setStore(initialValue());

    // reject any waiters
    const oldReady = ready;
    ready = promiseWithResolvers<T>();
    setTimeout(() => oldReady.reject?.(new Error("Reset")), 0);
    updateState("unresolved");
  };

  return {
    load,
    refresh,
    reset,
    state: getState,
    store,
    ready: async () => {
      load();
      return ready.promise;
    },
  };
}
