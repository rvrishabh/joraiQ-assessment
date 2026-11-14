import { api } from "@/lib/axios";
import type { Student } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const studentQueryKeys = {
  all: ["students"] as const,
};

export function useStudentsQuery() {
  return useQuery({
    queryKey: studentQueryKeys.all,
    queryFn: async () => (await api.get<Student[]>("/users/students")).data,
  });
}
