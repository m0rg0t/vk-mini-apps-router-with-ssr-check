import type { Params } from '@remix-run/router';

export function getParamKeys(path: string | undefined): string[] {
  return path
    ?.match(/\/:[^/]+/g)
    ?.map((param) => param.replace('/', '')) ?? [];
}

export function fillParamsIntoPath(path: string, params: Params): string {
  return path.replace(/\/:([^/]+)/g, (_placeholder, paramName: string) => {
    const value = params[paramName];
    if (!value) {
      throw new Error(`Missing parameter ${paramName} while building route ${path}`);
    }
    return `/${value}`;
  });
}
