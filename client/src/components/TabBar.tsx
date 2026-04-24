import React from "react";
import { Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentPath, onNavigate }) => {
  const tabs = [
    { id: "home", label: "Hub", icon: Home, path: "/" },
    { id: "maria", label: "Maria", icon: MessageCircle, path: "/maria" },
  ];

  React.useEffect(() => {
    // Force redirect to home on initial load/refresh if not on a subpage
    if (window.location.pathname === "/maria") {
      onNavigate("/");
    }
  }, []);

  return (
    <div className="z-50 flex justify-center flex-shrink-0">
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 pt-2.5 pb-2">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center py-1 gap-1 transition-all duration-200 active:scale-95 min-w-[64px]",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-400 hover:text-gray-500"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className="transition-colors"
                />
                <span className={cn(
                  "text-[10px] leading-none transition-colors",
                  isActive ? "font-bold text-primary" : "font-semibold text-gray-400"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabBar;
