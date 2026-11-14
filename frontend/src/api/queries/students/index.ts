import { api } from "@/lib/axios";
import type { Student } from "@/types";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

/** Students fetched per page in the assignment picker. */
export const STUDENT_PAGE_SIZE = 30;

export const studentQueryKeys = {
  all: ["students"] as const,
  search: (search: string) => ["students", search] as const,
};

/**
 * Pages through students on the server (ordered by name, then id, so
 * offset paging is stable). Search also runs on the server, so any student
 * can be found without loading every page. Pass an already-debounced term.
 */
export function useStudentsQuery(search = "") {
  const term = search.trim();
  return useInfiniteQuery({
    queryKey: studentQueryKeys.search(term),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (
        await api.get<Student[]>("/users/students", {
          params: { page: pageParam, limit: STUDENT_PAGE_SIZE, ...(term && { search: term }) },
        })
      ).data,
    // A full page means there may be more; a short page is the last one.
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === STUDENT_PAGE_SIZE ? pages.length + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
