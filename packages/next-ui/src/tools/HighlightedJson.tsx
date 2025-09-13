'use client';

import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';

let shikiSingleton: Promise<Highlighter> | null = null;
async function getShiki(): Promise<Highlighter> {
  if (!shikiSingleton) {
    shikiSingleton = createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['ts'] });
  }
  return shikiSingleton;
}

function useHighlightedCode(code: string, lang: 'ts' | 'js' = 'ts') {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const highlighter = await getShiki();
        const dark =
          typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        const theme = dark ? 'github-dark' : 'github-light';
        const out = highlighter.codeToHtml(code, { lang, theme });
        if (mounted) setHtml(out);
      } catch {
        if (mounted) setHtml(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code, lang]);

  return { html, loading };
}

function formatValueForCopy(value: any): string {
  if (typeof value === 'function') {
    return value.toString();
  }
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function CopyButton({ value }: { value: any }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = formatValueForCopy(value);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      title="Copy value"
      aria-label="Copy value"
      className="ml-1 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

function FunctionEntry({ name, fn }: { name?: string; fn: Function }) {
  const [isOpen, setIsOpen] = useState(false);
  const code = fn.toString();
  const { html, loading } = useHighlightedCode(code, 'ts');
  return (
    <details onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="inline-flex items-center gap-1 cursor-pointer">
        {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {name && (
          <span className="text-purple-700 dark:text-purple-300 mr-1 inline-flex items-center">
            {name}:
            <CopyButton value={fn} />
          </span>
        )}
        <span className="text-amber-700 dark:text-amber-300">ƒ {fn.name || 'anonymous'}</span>
      </summary>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 p-2">
          <span className="animate-spin inline-block w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent" />
          Highlighting...
        </div>
      ) : html ? (
        <div
          className="text-[12px] rounded border border-gray-200 dark:border-gray-700 overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="text-[12px] whitespace-pre-wrap text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
          <code className="language-ts">{code}</code>
        </pre>
      )}
    </details>
  );
}

function PrimitiveValue({ value }: { value: any }) {
  const typeOfValue = typeof value;
  if (value === null) {
    return <span className="text-gray-600 dark:text-gray-300">null</span>;
  }
  if (typeOfValue === 'string') {
    return <span className="text-emerald-700 dark:text-emerald-300">&quot;{value}&quot;</span>;
  }
  if (typeOfValue === 'number') {
    return <span className="text-blue-700 dark:text-blue-300">{String(value)}</span>;
  }
  if (typeOfValue === 'boolean') {
    return <span className="text-amber-700 dark:text-amber-300">{String(value)}</span>;
  }
  return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
}

function JsonNode({
  name,
  value,
  defaultOpen = false,
}: {
  name?: string;
  value: any;
  defaultOpen?: boolean;
}) {
  const isArray = Array.isArray(value);
  const isObject = value && typeof value === 'object' && !isArray;
  const [open, setOpen] = useState(defaultOpen);

  if (typeof value === 'function') {
    return <FunctionEntry name={name} fn={value} />;
  }

  if (!isObject && !isArray) {
    return (
      <div className="text-xs inline-flex items-center gap-1">
        {name !== undefined && (
          <span className="text-purple-700 dark:text-purple-300 mr-1 inline-flex items-center">
            {name}:
            <CopyButton value={value} />
          </span>
        )}
        <PrimitiveValue value={value} />
      </div>
    );
  }

  if (isArray) {
    return (
      <details open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary className="inline-flex items-center gap-1 cursor-pointer text-xs text-sky-700 dark:text-sky-300">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          {name !== undefined && (
            <span className="text-purple-700 dark:text-purple-300 inline-flex items-center">
              {name}:
              <CopyButton value={value} />
            </span>
          )}
          <span className="inline-flex items-center">
            Array[{(value as any[]).length}]{name === undefined && <CopyButton value={value} />}
          </span>
        </summary>
        <ul className="space-y-1 pl-3">
          {(value as any[]).map((item: any, idx: number) => (
            <li key={idx} className="pl-2 border-l border-gray-200 dark:border-gray-700">
              <JsonNode value={item} />
            </li>
          ))}
        </ul>
      </details>
    );
  }

  const entries = Object.entries(value as Record<string, any>);
  return (
    <details open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="inline-flex items-center gap-1 cursor-pointer text-xs text-indigo-700 dark:text-indigo-300">
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {name !== undefined ? (
          <span className="inline-flex items-center">
            {name}
            <CopyButton value={value} />
          </span>
        ) : (
          <span className="inline-flex items-center">
            Object
            <CopyButton value={value} />
          </span>
        )}
        <span className="text-gray-400 dark:text-gray-500">{` {${entries.length}}`}</span>
      </summary>
      <ul className="space-y-1 pl-3">
        {entries.map(([key, val]) => (
          <li key={key} className="pl-2 border-l border-gray-200 dark:border-gray-700">
            <JsonNode name={key} value={val} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function HighlightedJson({
  value,
  expandByDefault = true,
}: {
  value: any;
  expandByDefault?: boolean;
}) {
  return (
    <div className="text-[12px] text-gray-800 dark:text-gray-200 overflow-auto max-h-full p-2">
      <JsonNode value={value} defaultOpen={expandByDefault} />
    </div>
  );
}
