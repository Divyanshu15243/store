import { useQuery, useQueryClient } from "@tanstack/react-query";

//internal import
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";

// shared query definitions so prefetching and the search page use the same cache
export const storeProductsQuery = (category = "", title = "") => ({
  queryKey: ["store-products", category, title],
  queryFn: async () => {
    const data = await ProductServices.getShowingStoreProducts({
      category,
      title: title ? encodeURIComponent(title) : "",
    });
    return data?.products || [];
  },
  staleTime: 5 * 60 * 1000, // reopening a category within 5 minutes is instant
  gcTime: 15 * 60 * 1000,
});

export const attributesQuery = {
  queryKey: ["attributes"],
  queryFn: async () => await AttributeServices.getShowingAttributes({}),
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
};

export const useStoreProducts = (category, title, enabled = true) => {
  const products = useQuery({
    ...storeProductsQuery(category, title),
    enabled,
  });
  const attributes = useQuery(attributesQuery);
  return { products, attributes };
};

// start loading a category's products as soon as the finger touches it
export const usePrefetchCategory = () => {
  const queryClient = useQueryClient();
  return (categoryId) => {
    if (!categoryId) return;
    queryClient.prefetchQuery(storeProductsQuery(categoryId, ""));
    queryClient.prefetchQuery(attributesQuery);
  };
};
