import type { Component, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "../../../utils/cn";

const Table: Component<ComponentProps<"table">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <table
      class={cn("w-full border-separate border-spacing-0", local.class)}
      {...others}
    />
  );
};

const TableHeader: Component<ComponentProps<"thead">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <thead class={cn("text-xs [&>tr]:bg-none", local.class)} {...others} />
  );
};

const TableBody: Component<ComponentProps<"tbody">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return <tbody class={cn("[&>tr]:odd:bg-sub-alt", local.class)} {...others} />;
};

const TableFooter: Component<ComponentProps<"tfoot">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return <tfoot class={cn("", local.class)} {...others} />;
};

const TableRow: Component<ComponentProps<"tr">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <tr
      class={cn("[&>td]:first:rounded-l [&>td]:last:rounded-r", local.class)}
      {...others}
    />
  );
};

const TableHead: Component<ComponentProps<"th">> = (props) => {
  const [local, others] = splitProps(props, ["class", "aria-label"]);
  return (
    <th
      aria-label={local["aria-label"]}
      class={cn(
        "text-sub appearance-none p-0 text-left text-xs font-normal",
        local.class,
      )}
      {...others}
    />
  );
};

const TableCell: Component<ComponentProps<"td">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <td class={cn("appearance-none p-2 text-xs", local.class)} {...others} />
  );
};

const TableCaption: Component<ComponentProps<"caption">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return <caption class={cn("", local.class)} {...others} />;
};

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
