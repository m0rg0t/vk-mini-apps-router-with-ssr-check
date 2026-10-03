import { AgnosticRouteMatch, Location, RouterState } from '@remix-run/router';
import { RouteContextObject } from '../contexts';
import { PageInternal } from '../type';
import { STATE_KEY_SHOW_MODAL, STATE_KEY_SHOW_POPOUT } from '../const';
import { useState } from 'react';

export { getParamKeys, fillParamsIntoPath } from './pathParams';

export function getRouteContext(state: RouterState, panelsHistory: string[] = []): RouteContextObject {
  return {
    state,
    match: state.matches.length ? state.matches[state.matches.length - 1] as AgnosticRouteMatch<string, PageInternal> : undefined,
    panelsHistory: panelsHistory,
  };
}

export function isModalShown(location: Location): boolean {
  return location.state && STATE_KEY_SHOW_MODAL in location.state;
}

export function isPopoutShown(location: Location): boolean {
  return location.state && STATE_KEY_SHOW_POPOUT in location.state;
}

export function createKey() {
  const allNumbersAndLetters = 36;
  const positionAfterZeroAnDot = 2;
  const keyLength = 7;
  return Math.random().toString(allNumbersAndLetters).substring(positionAfterZeroAnDot, positionAfterZeroAnDot + keyLength);
}

export function getDisplayName(WrappedComponent: {displayName?: string; name?: string}) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function useForceUpdate() {
  const [, setState] = useState(0);

  return () => {
    setState(Date.now());
  };
}
