import { Fragment, type ReactNode } from "react";

export function rich(text: string, nodes: Readonly<Record<string, ReactNode>>): ReactNode[] {
  let offset = 0;
  return text.split(/(\{\w+\})/g).flatMap<ReactNode>((part) => {
    const start = offset;
    offset += part.length;
    if (part === "") return [];
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    if (name === undefined || !(name in nodes)) return [part];
    return [<Fragment key={`${name}:${start}`}>{nodes[name]}</Fragment>];
  });
}
