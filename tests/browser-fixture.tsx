import React, { createContext, createRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createHashRouter, RouterProvider, RouterLink } from '../src';
import { ThrottledContext } from '../src/contexts';
import { useThrottledContext } from '../src/hooks/useThrottledContext';

const valueContext = createContext('first');
function Value() {
  const [value] = useThrottledContext(valueContext);
  return <output>{value}</output>;
}
function Harness() {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState('first');
  return <>
    <button onClick={() => setEnabled(!enabled)}>Toggle throttle</button>
    <button onClick={() => setValue(value === 'first' ? 'second' : 'first')}>Change value</button>
    <ThrottledContext.Provider value={{ enabled, interval: 10, firstActionDelay: 0 }}>
      <valueContext.Provider value={value}><Value /></valueContext.Provider>
    </ThrottledContext.Provider>
  </>;
}
const win = window as unknown as Record<string, unknown>;
win.factories = { createBrowserRouter, createHashRouter };
win.renderHarness = () => {
  const element = document.createElement('div'); document.body.append(element);
  const root = createRoot(element);
  root.render(<Harness />);
};
win.renderLinks = () => {
  const router = createBrowserRouter([{ path: '/', view: 'main', panel: 'home' }, { path: '/next', view: 'main', panel: 'next' }]);
  const element = document.createElement('div'); document.body.append(element);
  const root = createRoot(element);
  const ref = createRef<HTMLAnchorElement>();
  win.linkRef = ref;
  root.render(<RouterProvider router={router} useBridge={false} throttled={false}>
    <RouterLink ref={ref} to="/next" className={({ isActive }) => isActive ? 'active-link' : 'inactive-link'}>
      {({ isActive }) => isActive ? 'Current next' : 'Go next'}
    </RouterLink>
  </RouterProvider>);
};
