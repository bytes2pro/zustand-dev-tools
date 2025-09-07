import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';
import { Slider } from '@/ui/slider';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DevtoolsSettings } from './types';

const LOCAL_STORAGE_KEY = 'zustandDevtoolsSettings';

export function useDevtoolsSettings(initial: DevtoolsSettings) {
  const [settings, setSettings] = useState<DevtoolsSettings>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as DevtoolsSettings;
    } catch {
      console.error('Error parsing settings from localStorage');
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      console.error('Error saving settings to localStorage');
    }
  }, [settings]);

  const reset = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      console.error('Error resetting settings');
    }
    setSettings(initial);
  };

  return { settings, setSettings, reset } as const;
}

export function SettingsView({
  settings,
  onChange,
  onReset,
}: {
  settings: DevtoolsSettings;
  onChange: (next: DevtoolsSettings) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <section className="rounded-md border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">History</div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Playback & Recording
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Checkbox
            checked={settings.history.recording}
            onCheckedChange={(v) =>
              onChange({
                ...settings,
                history: { ...settings.history, recording: Boolean(v) },
              })
            }
            title="Recording"
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 dark:text-gray-300">Delay</span>
            <div className="w-[160px]">
              <div className="px-2">
                <div className="w-full">
                  <Slider
                    min={100}
                    max={5000}
                    step={100}
                    value={[settings.history.playbackMs]}
                    onValueChange={(vals) =>
                      onChange({
                        ...settings,
                        history: { ...settings.history, playbackMs: vals[0] ?? 100 },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-300 tabular-nums w-14 text-right">
              {settings.history.playbackMs}ms
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 dark:text-gray-300">Max history</span>
            <Input
              className="w-16"
              type="number"
              min={10}
              max={1000}
              value={settings.history.maxHistory}
              onChange={(e) =>
                onChange({
                  ...settings,
                  history: { ...settings.history, maxHistory: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="rounded-md border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">Graph</div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Layout
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 dark:text-gray-300">Max depth</span>
            <Input
              className="w-16"
              type="number"
              min={1}
              max={10}
              value={settings.graph.maxDepth}
              onChange={(e) =>
                onChange({
                  ...settings,
                  graph: { ...settings.graph, maxDepth: Number(e.target.value) },
                })
              }
            />
          </div>
          <Checkbox
            checked={settings.graph.fitWidth}
            onCheckedChange={(v) =>
              onChange({
                ...settings,
                graph: { ...settings.graph, fitWidth: Boolean(v) },
              })
            }
            title="Fit width"
          />
        </div>
      </section>

      <Separator />

      <section className="rounded-md border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">JSON</div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Display
          </span>
        </div>
        <Checkbox
          checked={settings.json.expandByDefault}
          onCheckedChange={(v) =>
            onChange({
              ...settings,
              json: { ...settings.json, expandByDefault: Boolean(v) },
            })
          }
          title="Expand by default"
        />
      </section>

      <div className="pt-2">
        <Button onClick={onReset} variant="destructive" size="sm" title="Reset settings">
          <Trash2 className="size-4" /> Reset settings
        </Button>
      </div>
    </div>
  );
}
