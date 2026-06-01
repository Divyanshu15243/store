import useUtilsFunction from "@hooks/useUtilsFunction";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AttributeServices from "@services/AttributeServices";

const SKIP_KEYS = new Set(['_id','price','originalPrice','quantity','discount','productId','barcode','sku','image','profit']);

const getVariantLabel = (variant, attributes) => {
  if (!variant || !attributes?.length) return null;
  const parts = [];
  Object.keys(variant).forEach((key) => {
    if (SKIP_KEYS.has(key)) return;
    const attr = attributes.find((a) => a._id === key);
    if (!attr) return;
    const child = attr.variants?.find((v) => v._id === variant[key]);
    if (child) {
      const name = typeof child.name === 'object' ? (child.name?.en || Object.values(child.name)[0]) : child.name;
      if (name) parts.push(name);
    }
  });
  return parts.length ? parts.join(' / ') : null;
};

const getTitle = (title) => {
  if (typeof title === 'object') return title?.en || title?.de || Object.values(title)[0] || '';
  return title || '';
};

const OrderTable = ({ data, currency }) => {
  const { getNumberTwo } = useUtilsFunction();

  const { data: attributes } = useQuery({
    queryKey: ['attributes-show'],
    queryFn: () => AttributeServices.getShowingAttributes(),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <tbody className="bg-white divide-y divide-gray-100 text-serif text-sm">
      {data?.cart?.map((item, i) => {
        const baseTitle = getTitle(item.title).replace(/\s*\([a-f0-9]{24}\s*\/\s*[\d.]+\)/gi, '').trim();
        const variantLabel = getVariantLabel(item.variant, attributes);
        return (
          <tr key={i}>
            <th className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-left">
              {i + 1}
            </th>
            <td className="px-6 py-1 font-normal text-gray-500">
              {baseTitle}
              {variantLabel && (
                <span className="text-emerald-600 font-medium"> ({variantLabel})</span>
              )}
            </td>
            <td className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {item.quantity}
            </td>
            <td className="px-6 py-1 whitespace-nowrap font-bold text-center font-DejaVu">
              {currency}{getNumberTwo(item.price)}
            </td>
            <td className="px-6 py-1 whitespace-nowrap text-right font-bold font-DejaVu k-grid text-red-500">
              {currency}{getNumberTwo(item.itemTotal)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default OrderTable;
