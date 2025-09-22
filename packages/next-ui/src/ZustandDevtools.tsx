'use client';

import { GraphView } from '@/components/tools/GraphView';
import { HighlightedJson } from '@/components/tools/HighlightedJson';
import { HistoryView } from '@/components/tools/HistoryView';
import { SettingsView, useDevtoolsSettings } from '@/components/tools/SettingsView';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DevtoolsSettings, StoreInfo, ViewMode } from '@/types';
import { DatabaseZap, Loader2, Moon, Settings2, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PortalContainerContext } from './portal-context';

// Deeply serialize objects for display: Map -> object, Set -> array, Date -> ISO
function serializeState(value: any, seen = new WeakSet()): any {
  if (value === null) return value;
  if (typeof value === 'function') return value; // keep functions for Tree view
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) {
    const obj: Record<string, any> = {};
    value.forEach((v, k) => {
      const key = typeof k === 'string' ? k : JSON.stringify(k);
      obj[key] = serializeState(v, seen);
    });
    return obj;
  }
  if (value instanceof Set) {
    return Array.from(value).map((v) => serializeState(v, seen));
  }
  if (Array.isArray(value)) {
    return value.map((v) => serializeState(v, seen));
  }
  const result: Record<string, any> = {};
  Object.keys(value).forEach((k) => {
    result[k] = serializeState((value as any)[k], seen);
  });
  return result;
}

interface ZustandDevtoolsProps {
  stores: StoreInfo[];
  defaultSettings?: Partial<DevtoolsSettings>;
  className?: string;
}

export const ZustandDevtools: React.FC<ZustandDevtoolsProps> = ({
  stores,
  defaultSettings,
  className = 'bottom-2 right-2',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [popoverSide, setPopoverSide] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [popoverAlign, setPopoverAlign] = useState<'start' | 'center' | 'end'>('end');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('json');
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const zustandStores = useMemo(() => stores, [stores]);

  const mergedDefaults: DevtoolsSettings = {
    history: {
      maxHistory: defaultSettings?.history?.maxHistory ?? 100,
      playbackMs: defaultSettings?.history?.playbackMs ?? 1200,
      recording: true,
    },
    graph: { maxDepth: 3, fitWidth: true },
    json: { expandByDefault: true },
  };
  if (defaultSettings) {
    mergedDefaults.history = { ...mergedDefaults.history, ...(defaultSettings.history || {}) };
    mergedDefaults.graph = { ...mergedDefaults.graph, ...(defaultSettings.graph || {}) };
    mergedDefaults.json = { ...mergedDefaults.json, ...(defaultSettings.json || {}) };
  }

  const { settings, setSettings, reset } = useDevtoolsSettings(mergedDefaults);

  useEffect(() => {
    // consider app "loaded" after first paint
    const id = requestAnimationFrame(() => setIsAppLoading(false));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    // Initialize theme based on host document, but keep it scoped to devtools only
    const hostIsDark = document.documentElement.classList.contains('dark');
    setIsDark(hostIsDark);
  }, []);

  useEffect(() => {
    // Reflect local dark mode on the scoped root element only
    if (rootRef.current) {
      rootRef.current.classList.toggle('zdt-dark', isDark);
    }
  }, [isDark]);

  const computePlacement = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const verticalCenter = rect.top + rect.height / 2;
    const horizontalCenter = rect.left + rect.width / 2;

    const side = verticalCenter > vh / 2 ? 'top' : 'bottom';
    let align: 'start' | 'center' | 'end' = 'center';
    if (horizontalCenter < vw * 0.33) align = 'start';
    else if (horizontalCenter > vw * 0.66) align = 'end';

    setPopoverSide(side);
    setPopoverAlign(align);
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    if (!selectedStore && stores.length > 0) setSelectedStore(stores[0].name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  const selectedStoreData = zustandStores.find((store) => store.name === selectedStore);
  const serializedRaw = selectedStoreData?.state;
  const serialized = useMemo(
    () => (selectedStoreData ? serializeState(serializedRaw) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serializedRaw],
  );

  return (
    <div ref={rootRef} className="zustand-devtools">
      <PortalContainerContext.Provider value={rootRef.current}>
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            if (open) {
              computePlacement();
            }
            setIsOpen(open);
          }}
        >
          {/* Toggle Button */}
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              className={cn(
                'fixed z-50 overflow-hidden rounded-full w-12 h-12 flex items-center justify-center shadow-xl ring-2 ring-ring bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200',
                className,
              )}
              title="Zustand DevTools"
            >
              {isAppLoading ? (
                <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
              ) : (
                <DatabaseZap className="w-6 h-6 text-primary-foreground" />
              )}
            </button>
          </PopoverTrigger>

          {/* Floating Panel */}
          <PopoverContent
            side={popoverSide}
            align={popoverAlign}
            sideOffset={10}
            className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border w-[480px] h-[420px] overflow-hidden p-0"
          >
            {/* Header */}
            <div className="bg-inherit">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary text-secondary-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                    Z
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">Zustand DevTools</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Tabs */}
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <TabsList>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="graph">Graph</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <button
                    onClick={() => setViewMode('settings')}
                    className="p-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Store Selector */}
              <div className="px-4 py-2 border-b border-border bg-card text-card-foreground">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {zustandStores.map((store) => (
                      <SelectItem key={store.name} value={store.name} className="text-xs pl-8">
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-scroll flex flex-col h-full">
              <div className="flex flex-col bg-background">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsContent value="json" className="m-0 p-0">
                    {serialized ? (
                      <HighlightedJson
                        value={serialized}
                        expandByDefault={settings.json.expandByDefault}
                      />
                    ) : (
                      <div className="text-muted-foreground text-center mt-2 p-2 text-[12px]">
                        No store selected
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="history" className="m-0 p-0">
                    <HistoryView
                      setIsRecording={(v) => {
                        setSettings((s) => ({ ...s, history: { ...s.history, recording: v } }));
                      }}
                      isRecording={settings.history.recording}
                      selectedStore={selectedStore}
                      selectedStoreData={selectedStoreData}
                      stores={zustandStores}
                      maxHistory={settings.history.maxHistory}
                      historyPlaybackMs={settings.history.playbackMs}
                    />
                  </TabsContent>
                  <TabsContent value="graph" className="m-0 p-0">
                    {serialized ? (
                      <GraphView
                        data={serialized}
                        initialMaxDepth={settings.graph.maxDepth}
                        initialFitWidth={settings.graph.fitWidth}
                      />
                    ) : (
                      <div className="text-muted-foreground text-center mt-2 p-2 text-[12px]">
                        No store selected
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="settings" className="m-0 p-0">
                    <SettingsView settings={settings} onChange={setSettings} onReset={reset} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </PortalContainerContext.Provider>
    </div>
  );
};
