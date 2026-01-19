import { render, screen, waitFor } from "@solidjs/testing-library";
import { createResource, Resource } from "solid-js";
import { describe, it, expect } from "vitest";

import AsyncContent from "../../src/ts/components/common/AsyncContent";
import {
  AsyncStore,
  createAsyncStore,
} from "../../src/ts/stores/utils/asyncStore";

describe("AsyncContent", () => {
  it("renders loading state while resource is pending", () => {
    const [resource] = createResource(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "data";
    });

    const { container } = renderWithResource(resource);

    const preloader = container.querySelector(".preloader");
    expect(preloader).toBeInTheDocument();
    expect(preloader).toHaveClass("preloader");
    expect(preloader?.querySelector("i")).toHaveClass(
      "fas",
      "fa-fw",
      "fa-spin",
      "fa-circle-notch",
    );
  });

  it("renders data when resource resolves", async () => {
    const [resource] = createResource(async () => {
      return "Test Data";
    });

    renderWithResource(resource);

    await waitFor(() => {
      expect(screen.getByTestId("content")).toHaveTextContent("Test Data");
    });
  });

  it("renders error message when resource fails", async () => {
    const [resource] = createResource(async () => {
      throw new Error("Test error");
    });

    renderWithResource(resource, "Custom error message");

    await waitFor(() => {
      expect(screen.getByText(/Custom error message/)).toBeInTheDocument();
    });
  });

  it("renders default error message when no custom message provided", async () => {
    const [resource] = createResource(async () => {
      throw new Error("Test error");
    });

    renderWithResource(resource);

    await waitFor(() => {
      expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    });
  });

  it("renders loading state while loadingStore is pending", () => {
    const loadingStore = createAsyncStore(
      "test",
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { data: "data" };
      },
      () => ({}),
    );

    const { container } = renderWithLoadingStore(loadingStore);

    const preloader = container.querySelector(".preloader");
    expect(preloader).toBeInTheDocument();
    expect(preloader).toHaveClass("preloader");
    expect(preloader?.querySelector("i")).toHaveClass(
      "fas",
      "fa-fw",
      "fa-spin",
      "fa-circle-notch",
    );
  });

  it("renders data when loadingStore resolves", async () => {
    const loadingStore = createAsyncStore<{ data?: string }>(
      "test",
      async () => {
        return { data: "Test Data" };
      },
      () => ({}),
    );

    renderWithLoadingStore(loadingStore);

    await waitFor(() => {
      expect(screen.getByTestId("content")).toHaveTextContent("Test Data");
    });
  });

  it("renders error message when loadingStore fails", async () => {
    const loadingStore = createAsyncStore(
      "test",
      async () => {
        throw new Error("Test error");
      },
      () => ({}),
    );

    renderWithLoadingStore(loadingStore, "Custom error message");

    await waitFor(() => {
      expect(screen.getByText(/Custom error message/)).toBeInTheDocument();
    });
  });

  function renderWithResource<T>(
    resource: Resource<T>,
    errorMessage?: string,
  ): {
    container: HTMLElement;
  } {
    const { container } = render(() => (
      <AsyncContent resource={resource} errorMessage={errorMessage}>
        {(data) => <div data-testid="content">{String(data)}</div>}
      </AsyncContent>
    ));

    return {
      container,
    };
  }

  function renderWithLoadingStore(
    loadingStore: AsyncStore<{ data?: string }>,
    errorMessage?: string,
  ): {
    container: HTMLElement;
  } {
    loadingStore.load();
    const { container } = render(() => (
      <AsyncContent asyncStore={loadingStore} errorMessage={errorMessage}>
        {(data) => <div data-testid="content">{data.data}</div>}
      </AsyncContent>
    ));

    return {
      container,
    };
  }
});
