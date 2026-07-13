import { queryKeys } from "@/lib/react-query";
import { fetchHomeProperties } from "@/lib/services/properties";
import { useQuery } from "@tanstack/react-query";

export function useHomeProperties() {
  return useQuery({
    queryKey: queryKeys.properties.home(),
    queryFn: fetchHomeProperties,
  });
}
