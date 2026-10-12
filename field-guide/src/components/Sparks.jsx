import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ClickSpark from '../vendor/react-bits/ClickSpark.jsx';

const SparkCtx = createContext({ celebrate: () => {}, enabled: true, setEnabled: () => {} });

/** React Bits <ClickSpark> wrapped around the whole app, plus an imperative celebrate(el) for wins. */
export function SparksProvider({ children }) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('field-guide:sparks') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('field-guide:sparks', enabled ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const celebrate = useCallback((el) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    ref.current?.spark(r.left + r.width / 2, r.top + r.height / 2);
  }, []);

  const value = useMemo(() => ({ celebrate, enabled, setEnabled }), [celebrate, enabled]);
  return (
    <SparkCtx.Provider value={value}>
      <ClickSpark
        ref={ref}
        disabled={!enabled}
        sparkColor={['#d93a22', '#f2c230', '#2b7f5a']}
        sparkCount={9}
        sparkRadius={26}
        sparkSize={11}
        sparkWidth={2.5}
        shape="line"
        duration={560}
        style={{ height: 'auto', minHeight: '100%' }}
      >
        {children}
      </ClickSpark>
    </SparkCtx.Provider>
  );
}

export const useSparks = () => useContext(SparkCtx);
