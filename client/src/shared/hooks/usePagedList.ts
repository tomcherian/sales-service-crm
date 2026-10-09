import { useEffect, useState } from "react";
import type { ListParams } from "../api/types";

/**
 * Page, page size and search state for a server-paginated list.
 * `params` uses a debounced search so typing doesn't fire a request per keystroke.
 */
export function usePagedList(initialLimit = 10, debounceMs = 300) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const params: ListParams = { page, limit, search: debouncedSearch };

  // Spread straight into <DataTable /> for its paging and search props.
  const tableProps = {
    page,
    limit,
    search,
    onPageChange: setPage,
    onLimitChange: (value: number) => {
      setLimit(value);
      setPage(1);
    },
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
  };

  return { params, tableProps };
}
