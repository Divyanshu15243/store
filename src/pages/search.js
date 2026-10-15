import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

//internal import
import Layout from "@layout/Layout";
import useFilter from "@hooks/useFilter";
import Card from "@components/cta-card/Card";
import ProductCard from "@components/product/ProductCard";
import CategoryCarousel from "@components/carousel/CategoryCarousel";
import { useStoreProducts } from "@hooks/useStoreProducts";

// grey boxes shown while products load, so the page appears instantly
const ProductSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-md border border-gray-100 bg-white p-3"
      >
        <div className="h-32 w-full rounded bg-gray-200" />
        <div className="mt-3 h-3 w-3/4 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

// products are fetched in the browser (and cached) instead of on the server,
// so opening a category no longer waits for a full server round trip
const Search = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { query, _id } = router.query;

  const {
    products: { data: products, isLoading: productsLoading },
    attributes: { data: attributes },
  } = useStoreProducts(_id || "", query || "", router.isReady);

  const isLoading = !router.isReady || productsLoading;

  const { setSortedField, productData } = useFilter(products);

  return (
    <Layout title="Search" description="This is search page">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="flex py-10 lg:py-12">
          <div className="flex w-full">
            <div className="w-full">
              <div className="w-full grid grid-col gap-4 grid-cols-1 2xl:gap-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
                <Card />
              </div>
              <div className="relative">
                <CategoryCarousel />
              </div>
              {isLoading ? null : productData?.length === 0 ? (
                <div className="mx-auto p-5 my-5">
                  <Image
                    className="my-4 mx-auto"
                    src="/no-result.svg"
                    alt="no-result"
                    width={400}
                    height={380}
                  />
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                    {t("sorryText")} 😞
                  </h2>
                </div>
              ) : (
                <div className="hidden justify-between my-3 bg-orange-100 border border-gray-100 rounded p-3">
                  <h6 className="text-sm font-serif">
                    {t("totalI")}{" "}
                    <span className="font-bold">{productData?.length}</span>{" "}
                    {t("itemsFound")}
                  </h6>
                  <span className="text-sm font-serif">
                    <select
                      onChange={(e) => setSortedField(e.target.value)}
                      className="py-0 text-sm font-serif font-medium block w-full rounded border-0 bg-white pr-10 cursor-pointer focus:ring-0"
                    >
                      <option className="px-3" value="All" defaultValue hidden>
                        {t("sortByPrice")}
                      </option>
                      <option className="px-3" value="Low">
                        {t("lowToHigh")}
                      </option>
                      <option className="px-3" value="High">
                        {t("highToLow")}
                      </option>
                    </select>
                  </span>
                </div>
              )}

              {isLoading ? (
                <ProductSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                    {productData?.map((product, i) => (
                      <ProductCard
                        key={product._id || i}
                        product={product}
                        attributes={attributes}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
