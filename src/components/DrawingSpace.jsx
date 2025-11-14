import React, { useMemo, useEffect, useRef } from 'react';
import {
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuItem,
} from '@tldraw/tldraw';
import { throttle, debounce } from 'lodash';

/**
 * DrawingSpace
 * TLDraw canvas editor with persistent save & reload.
 */
export function DrawingSpace({ content, onChange, onSave, onDelete, theme }) {
  const isFileEditor = content !== undefined;
  const store = useMemo(() => createTLStore(), []);

  // Track whether content has been loaded for this file
  const hasLoadedRef = useRef(false);
  const prevContentRef = useRef(null);

  // 1. Reset when switching between canvases
  useEffect(() => {
    if (content !== prevContentRef.current) {
      hasLoadedRef.current = false;
      prevContentRef.current = content;
    }
  }, [content]);

  // 2. Load snapshot into TLDraw (REVISED LOGIC FOR ROBUSTNESS)
  useEffect(() => {
    if (!isFileEditor || !content || hasLoadedRef.current) return;

    try {
      let data;
      if (typeof content === 'string' && content.trim().startsWith('{')) {
          // Attempt to parse string content (expected format for new saves)
          data = JSON.parse(content);
      } else if (typeof content === 'object') {
          // Content is already an object (e.g., from cache or App.jsx resolved content)
          data = content;
      } else {
          // Content is not a loadable format (e.g., empty string, null, undefined)
          return;
      }
      
      // Attempt to find the core snapshot structure within the loaded data
      let snapshot = null;
      if (data.store) { // Case 1: Data is the snapshot itself
          snapshot = data;
      } else if (data.content && data.content.store) {
          // Case 2: Fallback for an unexpected wrapper structure (e.g., old file format)
          snapshot = data.content;
      }
      
      if (snapshot && snapshot.store) {
        loadSnapshot(store, snapshot);
        hasLoadedRef.current = true;
        console.log('[TLDraw] Canvas loaded from snapshot.');
      } else {
        // Fallback: If content was successfully loaded but lacks a store, load empty state.
        console.warn('[TLDraw] Content loaded successfully but is empty or missing store. Loading default state.');
      }
    } catch (err) {
      // Catch JSON parsing errors or other read errors.
      console.error('[TLDraw] Error parsing or loading content, skipping:', err);
    }
  }, [content, isFileEditor, store]);

  // 3. Propagate changes up every 500ms
  useEffect(() => {
    if (!isFileEditor || !onChange) return;

    const throttled = throttle(() => {
      const snapshot = getSnapshot(store);
      onChange(snapshot);
    }, 500);

    const unsubscribe = store.listen(throttled, { scope: 'document' });
    return () => {
      unsubscribe();
      throttled.cancel();
    };
  }, [store, isFileEditor, onChange]);

  // 4. Manual Save
  const handleManualSave = () => {
    const snapshot = getSnapshot(store);
    if (onChange) onChange(snapshot);
    if (onSave) onSave(snapshot);
    console.log('[Manual Save] Canvas saved manually.');
  };

  // 5. Auto-save (10s after inactivity)
  useEffect(() => {
    if (!isFileEditor || !onSave) return;

    const debouncedAutoSave = debounce(() => {
      const snapshot = getSnapshot(store);
      onSave(snapshot);
      console.log('[AutoSave] Canvas saved automatically.');
    }, 10000);

    const listener = store.listen(() => debouncedAutoSave(), { scope: 'document' });
    return () => {
      listener();
      debouncedAutoSave.cancel();
    };
  }, [store, isFileEditor, onSave]);

  // 6. Toolbar UI
  const CustomToolbar = () => (
    <DefaultToolbar>
      {isFileEditor && (
        <>
          <TldrawUiMenuItem
            id="save"
            title="Save Canvas"
            icon="check"
            onSelect={handleManualSave}
          />
          <TldrawUiMenuItem
            id="delete"
            title="Delete Canvas"
            icon="trash"
            onSelect={() => onDelete?.()}
          />
        </>
      )}
      <DefaultToolbarContent />
    </DefaultToolbar>
  );

  // 7. Render TLDraw
  return (
    // FIX: Added pointer-events-auto to ensure clicks are registered on the TLDRAW canvas
    <div className="w-full h-full relative pointer-events-auto"> 
      <Tldraw
        store={store}
        forceUiDarkMode={theme === 'dark'}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}