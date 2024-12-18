import {
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";
import {
  Link as ReactRouterLink,
  type LinkProps as ReactRouterLinkProps,
} from "react-router";

// @ts-types="@types/react"
import * as React from "react";

// export interface LinkProps extends ReactRouterLinkProps, ChakraLinkProps {}

const reactRouterLinkPropNames = [
  "replace",
  "state",
  "preventScrollReset",
  "relative",
  "to",
  "viewTransition",
  "children",
] as const;

export type LinkProps = ChakraLinkProps &
  Pick<ReactRouterLinkProps, (typeof reactRouterLinkPropNames)[number]> & {
    ref?: React.Ref<HTMLAnchorElement>;
  };

export function Link(props: LinkProps) {
  const reactRouterLinkProps = pick(props, [...reactRouterLinkPropNames]);
  const rest = omit(props, [...reactRouterLinkPropNames]);

  return (
    <ChakraLink {...rest} asChild>
      <ReactRouterLink {...reactRouterLinkProps} />
    </ChakraLink>
  );
}

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  const target: Partial<T> = {};

  for (const key of keys) {
    if (key in obj) {
      target[key] = obj[key];
    }
  }

  return target as Pick<T, K>;
}

function omit<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  const target: Partial<T> = { ...obj };

  for (const key of keys) {
    delete target[key];
  }

  return target as Omit<T, K>;
}
