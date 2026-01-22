import {
  AccessorKeyColumnDef,
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/solid-table";
import { createMemo, createSignal, For, JSXElement, Show } from "solid-js";

import { bp } from "../../../signals/breakpoints";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

export type AnyColumnDef<TData, TValue> =
  | ColumnDef<TData, TValue>
  //  | AccessorFnColumnDef<TData, TValue>
  | AccessorKeyColumnDef<TData, TValue>;

type DataTableProps<TData, TValue> = {
  columns: AnyColumnDef<TData, TValue>[];
  data: TData[];
};

export function DataTable<TData>(
  // oxlint-disable-next-line typescript/no-explicit-any
  props: DataTableProps<TData, any>,
): JSXElement {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const columnVisibility = createMemo(() => {
    const current = bp();
    const result = Object.fromEntries(
      props.columns.map((col) => {
        //fill missing columnIds, otherwise hidinc columns will not work
        if (col.id === undefined) {
          if ("accessorKey" in col) {
            col.id = col.accessorKey as string;
          }
        }
        return [col.id as string, current[col.meta?.breakpoint ?? "xxs"]];
      }),
    );

    return result;
  });

  const table = createSolidTable<TData>({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      get sorting() {
        return sorting();
      },
      get columnVisibility() {
        return columnVisibility();
      },
    },
  });

  return (
    <Table>
      <TableHeader>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <TableRow>
              <For each={headerGroup.headers}>
                {(header) => (
                  <TableHead
                    colSpan={header.colSpan}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    <Show when={!header.isPlaceholder}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Show>
                  </TableHead>
                )}
              </For>
            </TableRow>
          )}
        </For>
      </TableHeader>
      <TableBody>
        <Show
          when={table.getRowModel().rows?.length}
          fallback={
            <TableRow>
              <TableCell
                colSpan={props.columns.length}
                class="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          }
        >
          <For each={table.getRowModel().rows}>
            {(row) => (
              <TableRow data-state={row.getIsSelected() && "selected"}>
                <For each={row.getVisibleCells()}>
                  {(cell) => {
                    const cellMeta =
                      typeof cell.column.columnDef.meta?.cellMeta === "function"
                        ? cell.column.columnDef.meta.cellMeta({
                            value: cell.getValue(),
                            row: cell.row.original,
                          })
                        : (cell.column.columnDef.meta?.cellMeta ?? {});
                    return (
                      <TableCell {...cellMeta}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  }}
                </For>
              </TableRow>
            )}
          </For>
        </Show>
      </TableBody>
    </Table>
  );
}
