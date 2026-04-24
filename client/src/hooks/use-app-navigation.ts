import { useLocation } from "wouter";
import { useEcoNav } from "@/contexts/EcoNavContext";

export function useAppNavigation(): [string, (to: string) => void] {
  const [location, setLocation] = useLocation();
  const ecoNav = useEcoNav();

  if (ecoNav) {
    return [location, ecoNav.navigate];
  }

  return [location, setLocation];
}
