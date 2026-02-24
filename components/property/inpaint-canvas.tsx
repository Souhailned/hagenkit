"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface InpaintCanvasProps {
  /** URL of the source image to paint over */
  sourceImageUrl: string;
  /** Brush diameter in pixels (10-100) */
  brushSize: number;
  /** Additional class names for the outer container */
  className?: string;
}

export interface InpaintCanvasRef {
  /** Returns the mask as a white-on-transparent PNG data URL, or null */
  exportMask: () => string | null;
  /** Undo the last stroke */
  undo: () => void;
  /** Redo the last undone stroke */
  redo: () => void;
  /** Clear the entire mask */
  clearMask: () => void;
  /** Returns true if any mask pixels have been drawn */
  hasMask: () => boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

const MAX_UNDO_STEPS = 20;
const MIN_TOUCH_BRUSH = 20;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Build an SVG data-URL circle cursor matching the brush diameter. */
function buildCursorSvg(size: number): string {
  const r = size / 2 - 1;
  const c = size / 2;
  // Outer white ring + inner black ring for visibility on any background
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<circle cx='${c}' cy='${c}' r='${r}' fill='none' stroke='white' stroke-width='2'/>` +
    `<circle cx='${c}' cy='${c}' r='${Math.max(r - 1, 1)}' fill='none' stroke='black' stroke-width='1'/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${c} ${c}, crosshair`;
}

/** Detect coarse-pointer (touch) device. */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/* -------------------------------------------------------------------------- */
/*  Undo / redo snapshot pair                                                   */
/* -------------------------------------------------------------------------- */

interface SnapshotPair {
  overlay: ImageData;
  mask: ImageData;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                   */
/* -------------------------------------------------------------------------- */

export const InpaintCanvas = forwardRef<InpaintCanvasRef, InpaintCanvasProps>(
  function InpaintCanvas({ sourceImageUrl, brushSize, className }, ref) {
    /* -- Refs -------------------------------------------------------------- */
    const containerRef = useRef<HTMLDivElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // offscreen
    const imageRef = useRef<HTMLImageElement | null>(null);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    /* -- State ------------------------------------------------------------- */
    const [isDrawing, setIsDrawing] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    /* -- Undo / redo stacks ------------------------------------------------ */
    const undoStackRef = useRef<SnapshotPair[]>([]);
    const redoStackRef = useRef<SnapshotPair[]>([]);

    /* -- Effective brush size (enforce minimum on touch) -------------------- */
    const effectiveBrush = isTouchDevice()
      ? Math.max(brushSize, MIN_TOUCH_BRUSH)
      : brushSize;

    /* ====================================================================== */
    /*  1. Load the source image                                               */
    /* ====================================================================== */

    useEffect(() => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        // Retry without crossOrigin for same-origin images
        const retry = new Image();
        retry.onload = () => {
          imageRef.current = retry;
          setImageLoaded(true);
        };
        retry.src = sourceImageUrl;
      };
      img.src = sourceImageUrl;

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [sourceImageUrl]);

    /* ====================================================================== */
    /*  2. Calculate canvas dimensions to fit container + maintain ratio        */
    /* ====================================================================== */

    const recalculate = useCallback(() => {
      if (!imageRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const img = imageRef.current;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let width: number;
      let height: number;

      if (imgAspect > containerAspect) {
        // Image is wider than container — fit to width
        width = containerWidth;
        height = containerWidth / imgAspect;
      } else {
        // Image is taller than container — fit to height
        height = containerHeight;
        width = containerHeight * imgAspect;
      }

      width = Math.floor(width);
      height = Math.floor(height);

      // Bail if nothing changed (prevents infinite loops)
      setCanvasSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    }, []);

    /* ====================================================================== */
    /*  3. Setup all three canvases when size changes                           */
    /* ====================================================================== */

    useEffect(() => {
      if (!imageLoaded || !imageRef.current) return;
      if (canvasSize.width === 0 || canvasSize.height === 0) return;

      const { width, height } = canvasSize;
      const img = imageRef.current;

      // --- Image canvas (bottom) ---
      const imageCanvas = imageCanvasRef.current;
      if (imageCanvas) {
        imageCanvas.width = width;
        imageCanvas.height = height;
        const ctx = imageCanvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
      }

      // --- Overlay canvas (visible red strokes) ---
      const overlayCanvas = overlayCanvasRef.current;
      if (overlayCanvas) {
        overlayCanvas.width = width;
        overlayCanvas.height = height;
      }

      // --- Offscreen mask canvas (white strokes for export) ---
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      maskCanvasRef.current = maskCanvas;

      // Reset stacks on resize (canvas content is lost anyway)
      undoStackRef.current = [];
      redoStackRef.current = [];
    }, [imageLoaded, canvasSize]);

    /* ====================================================================== */
    /*  4. Recalculate on load + observe container resizes                     */
    /* ====================================================================== */

    useEffect(() => {
      if (!imageLoaded) return;

      // Initial calculation
      recalculate();

      const container = containerRef.current;
      if (!container) return;

      const observer = new ResizeObserver(() => {
        recalculate();
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }, [imageLoaded, recalculate]);

    /* ====================================================================== */
    /*  5. Save / restore snapshot helpers                                     */
    /* ====================================================================== */

    const saveSnapshot = useCallback(() => {
      const overlayCtx = overlayCanvasRef.current?.getContext("2d");
      const maskCtx = maskCanvasRef.current?.getContext("2d");
      if (!overlayCtx || !maskCtx) return;

      const { width, height } = canvasSize;
      if (width === 0 || height === 0) return;

      const pair: SnapshotPair = {
        overlay: overlayCtx.getImageData(0, 0, width, height),
        mask: maskCtx.getImageData(0, 0, width, height),
      };

      undoStackRef.current.push(pair);
      // Clear redo when a new stroke is made
      redoStackRef.current = [];

      // Enforce max stack size
      if (undoStackRef.current.length > MAX_UNDO_STEPS) {
        undoStackRef.current.shift();
      }
    }, [canvasSize]);

    /* ====================================================================== */
    /*  6. Drawing logic                                                       */
    /* ====================================================================== */

    const getCanvasPoint = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      },
      [],
    );

    /** Draw a filled circle at (x, y) on both overlay and mask canvases. */
    const drawDot = useCallback(
      (x: number, y: number) => {
        const radius = effectiveBrush / 2;

        // Overlay: semi-transparent red for visual feedback
        const overlayCtx = overlayCanvasRef.current?.getContext("2d");
        if (overlayCtx) {
          overlayCtx.globalCompositeOperation = "source-over";
          overlayCtx.fillStyle = "rgba(255, 0, 0, 0.4)";
          overlayCtx.beginPath();
          overlayCtx.arc(x, y, radius, 0, Math.PI * 2);
          overlayCtx.fill();
        }

        // Mask: opaque white for fal.ai export
        const maskCtx = maskCanvasRef.current?.getContext("2d");
        if (maskCtx) {
          maskCtx.globalCompositeOperation = "source-over";
          maskCtx.fillStyle = "#FFFFFF";
          maskCtx.beginPath();
          maskCtx.arc(x, y, radius, 0, Math.PI * 2);
          maskCtx.fill();
        }
      },
      [effectiveBrush],
    );

    /**
     * Interpolate between two points so fast pointer moves don't leave gaps.
     * Draws circles along the line at intervals of ~1/4 the brush size.
     */
    const drawLine = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(effectiveBrush / 4, 1);
        const steps = Math.ceil(dist / step);

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          drawDot(from.x + dx * t, from.y + dy * t);
        }
      },
      [effectiveBrush, drawDot],
    );

    /* -- Pointer event handlers ------------------------------------------- */

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        // Capture the pointer for reliable move/up tracking
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        saveSnapshot();
        setIsDrawing(true);

        const point = getCanvasPoint(e);
        drawDot(point.x, point.y);
        lastPointRef.current = point;
      },
      [saveSnapshot, getCanvasPoint, drawDot],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();

        const point = getCanvasPoint(e);
        const last = lastPointRef.current;

        if (last) {
          drawLine(last, point);
        } else {
          drawDot(point.x, point.y);
        }

        lastPointRef.current = point;
      },
      [isDrawing, getCanvasPoint, drawDot, drawLine],
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setIsDrawing(false);
        lastPointRef.current = null;
      },
      [],
    );

    /* ====================================================================== */
    /*  7. Imperative handle                                                   */
    /* ====================================================================== */

    useImperativeHandle(
      ref,
      () => ({
        exportMask: () => {
          const maskCanvas = maskCanvasRef.current;
          if (!maskCanvas) return null;
          try {
            return maskCanvas.toDataURL("image/png");
          } catch {
            return null;
          }
        },

        undo: () => {
          const pair = undoStackRef.current.pop();
          if (!pair) return;

          const overlayCtx = overlayCanvasRef.current?.getContext("2d");
          const maskCtx = maskCanvasRef.current?.getContext("2d");
          if (!overlayCtx || !maskCtx) return;

          const { width, height } = canvasSize;
          if (width === 0 || height === 0) return;

          // Push current state to redo before restoring
          redoStackRef.current.push({
            overlay: overlayCtx.getImageData(0, 0, width, height),
            mask: maskCtx.getImageData(0, 0, width, height),
          });

          overlayCtx.putImageData(pair.overlay, 0, 0);
          maskCtx.putImageData(pair.mask, 0, 0);
        },

        redo: () => {
          const pair = redoStackRef.current.pop();
          if (!pair) return;

          const overlayCtx = overlayCanvasRef.current?.getContext("2d");
          const maskCtx = maskCanvasRef.current?.getContext("2d");
          if (!overlayCtx || !maskCtx) return;

          const { width, height } = canvasSize;
          if (width === 0 || height === 0) return;

          // Push current state to undo before restoring
          undoStackRef.current.push({
            overlay: overlayCtx.getImageData(0, 0, width, height),
            mask: maskCtx.getImageData(0, 0, width, height),
          });

          overlayCtx.putImageData(pair.overlay, 0, 0);
          maskCtx.putImageData(pair.mask, 0, 0);
        },

        clearMask: () => {
          const overlayCtx = overlayCanvasRef.current?.getContext("2d");
          const maskCtx = maskCanvasRef.current?.getContext("2d");
          if (!overlayCtx || !maskCtx) return;

          const { width, height } = canvasSize;
          if (width === 0 || height === 0) return;

          // Save current state before clearing
          saveSnapshot();

          overlayCtx.clearRect(0, 0, width, height);
          maskCtx.clearRect(0, 0, width, height);
        },

        hasMask: () => {
          const maskCtx = maskCanvasRef.current?.getContext("2d");
          if (!maskCtx) return false;

          const { width, height } = canvasSize;
          if (width === 0 || height === 0) return false;

          const data = maskCtx.getImageData(0, 0, width, height).data;
          // Check alpha channel for any non-zero pixel
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
          }
          return false;
        },
      }),
      [canvasSize, saveSnapshot],
    );

    /* ====================================================================== */
    /*  8. Dynamic cursor                                                      */
    /* ====================================================================== */

    const cursorStyle = buildCursorSvg(effectiveBrush);

    /* ====================================================================== */
    /*  9. Render                                                              */
    /* ====================================================================== */

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          className,
        )}
        style={{ touchAction: "none" }}
      >
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <div
            className="relative"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            {/* Bottom layer: source image */}
            <canvas
              ref={imageCanvasRef}
              className="absolute inset-0"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            />

            {/* Top layer: red overlay for visual feedback */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                cursor: cursorStyle,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>
        )}

        {/* Loading spinner while the source image is fetched */}
        {!imageLoaded && (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    );
  },
);
