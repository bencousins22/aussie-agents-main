import { useDeferredValue, useMemo, useState } from "react";

/**
 * A custom hook that provides a debounced search functionality.
 * It uses React 19's useDeferredValue to handle performance efficiently.
 * 
 * @param items The array of items to search through
 * @param searchFn A function that defines how to filter the items based on the query
 */
export function useDebouncedSearch<T>(
  items: T[], 
  searchFn: (items: T[], query: string) => T[]
) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  
  const filteredItems = useMemo(() => {
    if (!deferredQuery.trim()) return items;
    return searchFn(items, deferredQuery);
  }, [items, deferredQuery, searchFn]);

  return {
    query,
    setQuery,
    filteredItems,
    isSearching: deferredQuery !== query
  };
}
