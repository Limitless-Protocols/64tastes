'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export type TabDef = { id: string; label: string; content: ReactNode };

export default function DishTabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (tabs.length === 0) return null;

  const focusTab = (index: number) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    setActive(tab.id);
    refs.current[tab.id]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    else if (e.key === 'End') { e.preventDefault(); focusTab(tabs.length - 1); }
  };

  return (
    <div className="mt-5">
      <div
        role="tablist"
        className="flex gap-1 rounded-2xl bg-[#F1F5EC] p-1 ring-1 ring-[#14261C]/10"
      >
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[t.id] = el; }}
              role="tab"
              type="button"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C3F] ${
                selected
                  ? 'bg-[#0F5C3F] text-white'
                  : 'text-[#6B7A70] hover:bg-[#14261C]/5 hover:text-[#14261C]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className="mt-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F5C3F] [&>*:first-child]:mt-0"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}