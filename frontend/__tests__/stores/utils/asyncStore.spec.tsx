import { vi, describe, it, expect, beforeEach } from "vitest";

import { createAsyncStore } from "../../../src/ts/stores/utils/asyncStore";

const mockFetcher = vi.fn();
const initialValue = vi.fn(() => ({ data: null }));

describe("createAsyncStore", () => {
  beforeEach(() => {
    mockFetcher.mockClear();
    initialValue.mockClear();
  });

  it("should initialize with the correct state", () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);

    expect(store.state().state).toBe("unresolved");
    expect(store.state().loading).toBe(false);
    expect(store.state().ready).toBe(false);
    expect(store.state().refreshing).toBe(false);
    expect(store.state().error).toBeUndefined();
    expect(store.store).toEqual({ data: null });
  });

  it("should transition to loading when load is called", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    store.load();

    expect(store.state().state).toBe("pending");
    expect(store.state().loading).toBe(true);
  });

  it("should enable loading if ready is called", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    mockFetcher.mockResolvedValueOnce({ data: "test" });

    await store.ready();
  });

  it("should call the fetcher when load is called", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    mockFetcher.mockResolvedValueOnce({ data: "test" });
    store.load();

    await store.ready();

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(store.state().state).toBe("ready");
    expect(store.store).toEqual({ data: "test" });
  });

  it("should handle error when fetcher fails", async () => {
    mockFetcher.mockRejectedValueOnce(new Error("Failed to load"));
    const store = createAsyncStore("test", mockFetcher, initialValue);

    store.load();

    await expect(store.ready()).rejects.toThrow("Failed to load");

    expect(store.state().state).toBe("errored");
    expect(store.state().error).toEqual(new Error("Failed to load"));
  });

  it("should transition to refreshing state on refresh", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    mockFetcher.mockResolvedValueOnce({ data: "test" });
    store.load();

    store.refresh(); // trigger refresh
    expect(store.state().state).toBe("refreshing");
    expect(store.state().refreshing).toBe(true);
  });

  it("should trigger load when refresh is called and shouldLoad is false", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    mockFetcher.mockResolvedValueOnce({ data: "test" });
    expect(store.state().state).toBe("unresolved");

    store.refresh();
    expect(store.state().state).toBe("refreshing");
    expect(store.state().refreshing).toBe(true);

    // Wait for the store to be ready after fetching
    await store.ready();

    // Ensure the store's state is 'ready' after the refresh
    expect(store.state().state).toBe("ready");
    expect(store.store).toEqual({ data: "test" });
  });

  it("should reset the store to its initial value on reset", async () => {
    const store = createAsyncStore("test", mockFetcher, initialValue);
    mockFetcher.mockResolvedValueOnce({ data: "test" });
    store.load();

    await store.ready();

    expect(store.store).toEqual({ data: "test" });

    store.reset();
    expect(store.state().state).toBe("unresolved");
    expect(store.state().loading).toBe(false);
    expect(store.store).toEqual({ data: null });
  });
});
