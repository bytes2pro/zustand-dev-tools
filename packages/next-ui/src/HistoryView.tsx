import { ScrollArea } from '@/ui/scroll-area';
import { Slider } from '@/ui/slider';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HistoryIcon,
  Pause,
  Play,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HighlightedJson } from './HighlightedJson';
import { HistoryEntry, StoreInfo } from './types';

interface HistoryViewProps {
  selectedStore: string;
  selectedStoreData: StoreInfo | undefined;
  setIsRecording: (isRecording: boolean) => void;
  isRecording: boolean;
  stores: StoreInfo[];
  maxHistory: number;
  historyPlaybackMs: number;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  selectedStore,
  selectedStoreData,
  setIsRecording,
  isRecording,
  stores,
  maxHistory = 100,
  historyPlaybackMs = 1200,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [historyByStore, setHistoryByStore] = useState<Record<string, HistoryEntry[]>>({});
  const [historyIndexByStore, setHistoryIndexByStore] = useState<Record<string, number>>({});
  const playbackTimerRef = useRef<number | null>(null);
  const isTimeTravelingRef = useRef<boolean>(false);

  const playbackMs = historyPlaybackMs;
  const MAX_HISTORY = maxHistory;

  const selectedHistory = selectedStore ? (historyByStore[selectedStore] ?? []) : [];
  const selectedHistoryIndex = selectedStore ? (historyIndexByStore[selectedStore] ?? 0) : 0;

  // Initialize and subscribe to store changes to capture history
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    stores.forEach(({ name, store }) => {
      // Initialize history with current state if not present
      setHistoryByStore((prev) => {
        if (prev[name]) return prev;
        const current = store.getState();
        return {
          ...prev,
          [name]: [{ ts: Date.now(), snapshot: current }],
        };
      });
      setHistoryIndexByStore((prev) => (prev[name] == null ? { ...prev, [name]: 0 } : prev));

      const unsub = store.subscribe((nextState: any, _prevState: any) => {
        if (!isRecording) return;
        if (isTimeTravelingRef.current) return;
        // Append to history and update index based on the new list length
        setHistoryByStore((prev) => {
          const list = prev[name] ?? [];
          const appended = [...list, { ts: Date.now(), snapshot: nextState }].slice(-MAX_HISTORY);
          // Keep index in sync with appended list length to avoid stale closures
          setHistoryIndexByStore((prevIdx) => ({
            ...prevIdx,
            [name]: Math.max(0, appended.length - 1),
          }));
          return { ...prev, [name]: appended };
        });
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, isRecording]);

  function applyHistoryIndex(index: number) {
    if (!selectedStoreData) return;
    const entries = historyByStore[selectedStoreData.name] ?? [];
    const clamped = Math.max(0, Math.min(index, entries.length - 1));
    const snapshot = entries[clamped]?.snapshot;
    if (!snapshot) return;
    try {
      isTimeTravelingRef.current = true;
      selectedStoreData.store.setState(snapshot, true);
      setHistoryIndexByStore((prev) => ({ ...prev, [selectedStoreData.name]: clamped }));
    } finally {
      // allow next microtask to avoid capturing own set
      setTimeout(() => {
        isTimeTravelingRef.current = false;
      }, 0);
    }
  }

  function step(delta: number) {
    applyHistoryIndex(selectedHistoryIndex + delta);
  }

  function jumpToStart() {
    applyHistoryIndex(0);
  }

  function jumpToEnd() {
    const last = (selectedHistory?.length ?? 1) - 1;
    applyHistoryIndex(last);
  }

  function togglePlay() {
    if (!selectedHistory || selectedHistory.length <= 1) return;
    setIsPlaying((prev) => !prev);
  }

  const currentHistoryIndex = useMemo(
    () => (selectedStore ? (historyIndexByStore[selectedStore] ?? 0) : 0),
    [selectedStore, historyIndexByStore],
  );

  useEffect(() => {
    // Manage playback interval lifecycle based on play state and speed
    if (!isPlaying) {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }
    if (!selectedHistory || selectedHistory.length <= 1) {
      setIsPlaying(false);
      return;
    }
    if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current);
    }
    playbackTimerRef.current = window.setInterval(
      () => {
        const idx = currentHistoryIndex;
        if (idx >= selectedHistory.length - 1) {
          setIsPlaying(false);
          if (playbackTimerRef.current) {
            window.clearInterval(playbackTimerRef.current);
            playbackTimerRef.current = null;
          }
          return;
        }
        applyHistoryIndex(idx + 1);
      },
      Math.max(100, playbackMs),
    );
    return () => {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, playbackMs, selectedStore, selectedHistory.length, currentHistoryIndex]);

  useEffect(() => {
    // reset playback when switching stores
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, [selectedStore]);

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={jumpToStart}
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
              title="First"
              aria-label="First"
              disabled={selectedHistoryIndex <= 0}
            >
              <ChevronsLeft className="size-4" />
            </button>
            <button
              onClick={() => step(-1)}
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
              title="Previous"
              aria-label="Previous"
              disabled={selectedHistoryIndex <= 0}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={togglePlay}
              className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 ${isPlaying ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-200'}`}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!selectedHistory || selectedHistory.length <= 1}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              onClick={() => step(1)}
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
              title="Next"
              aria-label="Next"
              disabled={
                !selectedHistory || selectedHistoryIndex >= Math.max(0, selectedHistory.length - 1)
              }
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={jumpToEnd}
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
              title="Last"
              aria-label="Last"
              disabled={
                !selectedHistory || selectedHistoryIndex >= Math.max(0, selectedHistory.length - 1)
              }
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
          <div className="flex flex-row items-center space-x-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <HistoryIcon className="size-4 text-gray-500 dark:text-gray-400" />
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`px-2 py-0.5 rounded text-[11px] border ${
                  isRecording
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                }`}
                title={isRecording ? 'Disable recording' : 'Enable recording'}
                aria-pressed={isRecording}
              >
                {isRecording ? 'Recording' : 'Record'}
              </button>
            </div>
            <div className="w-full max-w-[320px]">
              <Slider
                min={0}
                max={Math.max(0, (selectedHistory?.length ?? 1) - 1)}
                value={[selectedHistoryIndex]}
                onValueChange={([v]: [number]) => applyHistoryIndex(v)}
              />
            </div>
            <span className="text-[12px] text-gray-600 dark:text-gray-300 tabular-nums">
              {selectedHistoryIndex + 1}/{Math.max(1, selectedHistory?.length ?? 1)}
            </span>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {selectedStoreData ? (
            <HighlightedJson value={selectedHistory[selectedHistoryIndex]?.snapshot ?? {}} />
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-4">
              No store selected
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
