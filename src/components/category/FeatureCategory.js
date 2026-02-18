import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForwardSharp } from "react-icons/io5";

//internal import
import CategoryServices from "@services/CategoryServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCategory = () => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
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
    setIsLoading(!isLoading);
  };

  return (
    <>
      {loading ? (
        <CMSkeleton count={10} height={20} error={error} loading={loading} />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
          {data && data.length > 0 ? (
            data.flatMap((parent) => {
              if (!parent.children || parent.children.length === 0) return [];
              
              return parent.children.map((category) => (
                <li className="group" key={category._id}>
                  <div className="flex w-full h-full border border-gray-100 shadow-sm bg-white p-4 cursor-pointer transition duration-200 ease-linear transform group-hover:shadow-lg">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0">
                        <Image
                          src={category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"}
                          alt="category"
                          width={35}
                          height={35}
                        />
                      </div>

                      <div className="pl-4 flex-1">
                        <h3
                          onClick={() =>
                            handleCategoryClick(
                              category._id,
                              showingTranslateValue(category.name)
                            )
                          }
                          className="text-sm text-gray-600 font-medium leading-tight line-clamp-1 group-hover:text-orange-500 cursor-pointer"
                        >
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
                                  onClick={() =>
                                    handleCategoryClick(
                                      child._id,
                                      showingTranslateValue(child.name)
                                    )
                                  }
                                  className="flex items-center font-serif text-xs text-gray-400 cursor-pointer"
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
