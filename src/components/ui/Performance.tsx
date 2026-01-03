import { memo, useMemo, useCallback, useDeferredValue, useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

// Performance monitoring component
export const PerformanceMonitor = memo(function PerformanceMonitor({ 
  enabled = false, 
  className 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    componentCount: number;
    memoryUsage: number;
    lastUpdate: number;
  } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTimeout(() => setMetrics(null), 0);
      return;
    }

    const updateMetrics = () => {
      const startTime = performance.now();
      const componentCount = document.querySelectorAll('[data-component]').length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      setMetrics({
        renderTime: performance.now() - startTime,
        componentCount,
        memoryUsage: memoryUsage / 1024 / 1024, // Convert to MB
        lastUpdate: Date.now()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled || !metrics) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-zinc-700 rounded-lg p-2 text-xs text-white/60 font-mono",
      className
    )}>
      <div>⚡ {metrics.renderTime.toFixed(2)}ms</div>
      <div>📦 {metrics.componentCount} comps</div>
      <div>💾 {metrics.memoryUsage.toFixed(1)}MB</div>
    </div>
  );
});

// Virtualized list component for large datasets
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string;
  className?: string;
  overscan?: number;
}

export function VirtualizedList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  getItemKey,
  className,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const deferredScrollTop = useDeferredValue(scrollTop);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(deferredScrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((deferredScrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [deferredScrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div 
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleRange.startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
            return (
              <div key={key} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Lazy loading component
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyLoad({ 
  children, 
  fallback = <div className="animate-pulse bg-zinc-800 rounded h-20 w-full" />,
  rootMargin = "50px",
  threshold = 0.1
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : fallback}
    </div>
  );
}

// Optimized image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  placeholder?: string;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  loading = "lazy",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "/api/placeholder/400/300"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-white/40">
          <span>Failed to load</span>
        </div>
      ) : (
        <img
          src={error ? placeholder : src}
          alt={alt}
          loading={loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
});