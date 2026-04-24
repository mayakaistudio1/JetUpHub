import { createContext, useContext } from "react";

interface EcoNavContextValue {
  navigate: (path: string) => void;
}

export const EcoNavContext = createContext<EcoNavContextValue | null>(null);

export function useEcoNav() {
  return useContext(EcoNavContext);
}
