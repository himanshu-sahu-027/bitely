import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Package,
  Settings,
  Sparkles,
} from "lucide-react";

export default function Sidebar({ activeTab, onTabChange }) {
  const desktopNavRef = useRef(null);
  const desktopItemRefs = useRef({});
  const [desktopIndicator, setDesktopIndicator] = useState({
    top: 0,
    height: 0,
  });

  const menu = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "subscriptions", label: "Subscriptions", icon: Sparkles },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    const updateDesktopIndicator = () => {
      const container = desktopNavRef.current;
      const activeItem = desktopItemRefs.current[activeTab];

      if (!container || !activeItem) {
        return;
      }

      setDesktopIndicator({
        top: activeItem.offsetTop,
        height: activeItem.offsetHeight,
      });
    };

    updateDesktopIndicator();
    window.addEventListener("resize", updateDesktopIndicator);

    return () => window.removeEventListener("resize", updateDesktopIndicator);
  }, [activeTab]);

  return (
    <div className="bg-[#edf2f8] p-3 sm:p-4 md:p-6">
      <nav className="space-y-3">
        {/* Desktop: vertical menu */}
        <div ref={desktopNavRef} className="relative hidden lg:flex flex-col gap-3">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-[-1.5rem] z-0 bg-white transition-all duration-300 ease-out"
            style={{
              top: `${desktopIndicator.top}px`,
              height: `${desktopIndicator.height}px`,
            }}
          >
            <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-gradient-to-b from-cyan-400 to-pink-400" />
          </div>

          {menu.map((item) => {
            const isActive = item.id === activeTab;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                ref={(node) => {
                  desktopItemRefs.current[item.id] = node;
                }}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={[
                  "group relative z-10 flex w-full items-center gap-4 overflow-visible bg-transparent px-6 py-5 text-left transition-all",
                  isActive
                    ? "mr-[-1.5rem] font-semibold text-slate-950"
                    : "bg-transparent text-slate-800 hover:bg-white/70",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-400 bg-white text-slate-700 group-hover:border-slate-700",
                  ].join(" ")}
                >
                  <Icon size={18} />
                </span>
                <span className="text-[1.05rem]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile: stacked menu */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
          {menu.map((item) => {
            const isActive = item.id === activeTab;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={[
                  "group relative flex min-h-[3.5rem] w-full items-center gap-2 overflow-hidden rounded-xl px-2.5 py-2.5 text-left transition-all sm:min-h-[4rem] sm:px-3",
                  isActive
                    ? "bg-white font-semibold text-slate-950 shadow-sm before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-cyan-400 before:to-pink-400"
                    : "bg-transparent text-slate-800 hover:bg-white/70",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-400 bg-white text-slate-700 group-hover:border-slate-700",
                  ].join(" ")}
                >
                  <Icon size={15} />
                </span>
                <span className="truncate text-[0.8rem] leading-none sm:text-sm">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
