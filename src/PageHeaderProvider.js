import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext({ header: { title: "", subtitle: "" }, setHeader: () => {} });

export function PageHeaderProvider({ children }) {
  const [header, setHeader] = useState({ title: "", subtitle: "" });
  const value = useMemo(() => ({ header, setHeader }), [header]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePageHeader() {
  return useContext(Ctx).header;
}

/* Call inside each page to set the title/subtitle */
export function useDeclarePageHeader(title, subtitle = "") {
  const { setHeader } = useContext(Ctx);
  useEffect(() => {
    setHeader({ title, subtitle });
    return () => setHeader({ title: "", subtitle: "" });
  }, [title, subtitle, setHeader]);
}
