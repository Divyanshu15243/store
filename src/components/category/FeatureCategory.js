import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForwardSharp } from "react-icons/io5";

//internal import
import CategoryServices from "@services/CategoryServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCategory = () => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  const handleCategoryClick = (id, categoryName) => {
    const category_name = categoryName
      .toLowerCase()
      .replace(/[^A-Z0-9]+/gi, "-");
    const url = `/search?category=${category_name}&_id=${id}`;
    router.push(url);
  };

  return (
    <>
      {loading ? (
        <CMSkeleton count={10} height={20} error={error} loading={loading} />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2 sm:gap-px">
          {data && data.length > 0 ? (
            data.flatMap((parent) => {
              if (!parent.children || parent.children.length === 0) return [];
              
              return parent.children.map((category) => (
                <li className="group" key={category._id}>
                  {/* whole card is tappable, not just the name */}
                  <div
                    onClick={() =>
                      handleCategoryClick(
                        category._id,
                        showingTranslateValue(category.name)
                      )
                    }
                    className="flex w-full h-full border border-gray-100 shadow-sm bg-white p-4 sm:p-3 cursor-pointer rounded-lg sm:rounded-none transition duration-200 ease-linear transform group-hover:shadow-lg active:bg-gray-50 min-h-[90px] sm:min-h-[70px] touch-manipulation"
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-16 h-16 sm:w-9 sm:h-9 relative">
                        <Image
                          src={category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"}
                          alt={showingTranslateValue(category.name) || "category"}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>

                      <div className="pl-4 flex-1">
                        <h3 className="text-lg sm:text-sm text-gray-700 sm:text-gray-600 font-semibold sm:font-medium leading-snug whitespace-normal break-words group-hover:text-orange-500">
                          {showingTranslateValue(category.name)}
                        </h3>
                        {category.children && category.children.length > 0 && (
                          <ul className="pt-1 mt-1">
                            {category.children.slice(0, 3).map((child) => (
                              <li
                                key={child._id}
                                className="hover:text-orange-500 hover:ml-2 transition-all duration-150"
                              >
                                <a
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(
                                      child._id,
                                      showingTranslateValue(child.name)
                                    );
                                  }}
                                  className="flex items-center font-serif text-sm sm:text-xs text-gray-500 sm:text-gray-400 cursor-pointer whitespace-normal break-words py-0.5"
                                >
                                  <span className="text-xs text-gray-400">
                                    <IoChevronForwardSharp />
                                  </span>
                                  {showingTranslateValue(child.name)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ));
            })
          ) : (
            <li className="col-span-full text-center py-10 text-gray-500">
              No categories available
            </li>
          )}
        </ul>
      )}
    </>
  );
};

export default FeatureCategory;
