import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { Button } from '../../components/ui';
import {
  deriveImageKeyword,
  findCustomImageForTitle,
  removeCustomImageRule,
  type CustomImageRule,
} from '../../lib/customImages';
import { readImageFile } from '../../lib/readImageFile';

export interface CustomImageEditorProps {
  title: string;
  customImageKey?: string;
  onSave: (keyword: string, dataUrl: string) => void;
  onRemove: () => void;
}

export const CustomImageEditor: React.FC<CustomImageEditorProps> = ({
  title,
  customImageKey,
  onSave,
  onRemove,
}) => {
  const existing = findCustomImageForTitle(title, customImageKey);
  const [keyword, setKeyword] = useState(existing?.keyword ?? deriveImageKeyword(title));
  const [preview, setPreview] = useState(existing?.dataUrl ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const rule: CustomImageRule | null = findCustomImageForTitle(title, customImageKey);
    setKeyword(rule?.keyword ?? deriveImageKeyword(title));
    setPreview(rule?.dataUrl ?? '');
    setError('');
  }, [title, customImageKey]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    setError('');
    try {
      const dataUrl = await readImageFile(file);
      setPreview(dataUrl);
      if (!keyword.trim()) setKeyword(deriveImageKeyword(title));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not use that image.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (!preview) {
      setError('Choose an image first.');
      return;
    }
    if (!keyword.trim()) {
      setError('Add a word so ViDo knows when to reuse it.');
      return;
    }
    const nextKeyword = keyword.trim();
    if (existing && existing.keyword !== nextKeyword.toLowerCase()) {
      removeCustomImageRule(existing.keyword);
    }
    onSave(nextKeyword, preview);
    setError('');
  };

  return (
    <section className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <ImagePlus className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-[var(--ink)]">
            {preview ? 'Your image for this task' : 'No picture found for this task'}
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
            Add one and ViDo will reuse it for similar task names. Saved on this device.
          </p>

          {preview && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={preview}
                alt=""
                className="h-14 w-14 rounded-lg border border-[var(--line)] object-cover"
              />
              <label className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Reuse for tasks containing
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium normal-case tracking-normal text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  placeholder="e.g. sourdough"
                />
              </label>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="sr-only"
              aria-label="Choose a task image"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload className="h-3.5 w-3.5" /> {preview ? 'Choose another' : 'Choose image'}
            </Button>
            {preview && (
              <Button size="sm" variant="primary" onClick={handleSave} disabled={busy}>
                Save image
              </Button>
            )}
            {existing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onRemove();
                  setPreview('');
                  setKeyword(deriveImageKeyword(title));
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Forget
              </Button>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-[11px] font-medium text-[var(--amber)]">
              {error}
            </p>
          )}
          {busy && <p className="mt-2 text-[11px] text-[var(--muted)]">Preparing image…</p>}
        </div>
      </div>
    </section>
  );
};
