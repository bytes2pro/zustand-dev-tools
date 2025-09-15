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
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

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
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    <>
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
              'fixed z-50 overflow-hidden rounded-full w-12 h-12 flex items-center justify-center shadow-xl ring-2 ring-white/50 dark:ring-white/10 bg-gradient-to-br from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 transition-all duration-200',
              className,
            )}
            title="Zustand DevTools"
          >
            {isAppLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <DatabaseZap className="w-6 h-6 text-white" />
            )}
          </button>
        </PopoverTrigger>

        {/* Floating Panel */}
        <PopoverContent
          side={popoverSide}
          align={popoverAlign}
          sideOffset={10}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[480px] h-[420px] overflow-hidden p-0"
        >
          {/* Header */}
          <div className="bg-inherit">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-lime-50 to-yellow-50 dark:from-zinc-900 dark:to-zinc-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs">
                  Z
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Zustand DevTools
                </h3>
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
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Store Selector */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70">
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
            <div className="flex flex-col bg-white/50 dark:bg-gray-900/20">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsContent value="json" className="m-0 p-0">
                  {serialized ? (
                    <HighlightedJson
                      value={serialized}
                      expandByDefault={settings.json.expandByDefault}
                    />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center mt-2 p-2 text-[12px]">
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
                    <div className="text-gray-500 dark:text-gray-400 text-center mt-2 p-2 text-[12px]">
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
    </>
  );
};
