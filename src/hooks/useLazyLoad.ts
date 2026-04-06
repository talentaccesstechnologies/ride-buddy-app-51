import { useState, useCallback, useRef, useEffect } from 'react';

interface UseLazyLoadOptions<T> {
  items: T[];
  pageSize?: number;
}

export function useLazyLoad<T>({ items, pageSize = 10 }: UseLazyLoadOptions<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + pageSize, items.length));
  }, [pageSize, items.length]);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items.length, pageSize]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { visibleItems, hasMore, loadMore, loaderRef };
}
