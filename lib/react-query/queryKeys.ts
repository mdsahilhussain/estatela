export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    lists: () => [...queryKeys.properties.all, "list"] as const,
    home: () => [...queryKeys.properties.lists(), "home"] as const,
    detail: (propertyId: string) =>
      [...queryKeys.properties.all, "detail", propertyId] as const,
    search: (filters: {
      search: string;
      type: PropertyType;
      bedrooms: number | null;
      minPrice: number | null;
      maxPrice: number | null;
    }) => [...queryKeys.properties.lists(), "search", filters] as const,
  },
  userProfile: {
    all: ["userProfile"] as const,
    detail: (userId: string) => [...queryKeys.userProfile.all, userId] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    lists: () => [...queryKeys.favorites.all, "list"] as const,
    list: (userId: string) => [...queryKeys.favorites.lists(), userId] as const,
    status: (userId: string, propertyId: string) =>
      [...queryKeys.favorites.all, "status", userId, propertyId] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
  },
  admin: {
    all: ["admin"] as const,
  },
};
