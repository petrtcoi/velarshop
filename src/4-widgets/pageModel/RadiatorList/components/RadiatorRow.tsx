import { useStore } from "@nanostores/preact";

import { addToCart, storeShoppingCart } from "@features/order/ShoppingCart";

import { getGrillNotFit } from "@features/options/GrillNotFit";
import { getRadiatorTotalCost } from "@features/radiator/RadiatorTotalCost";

import type { ModelJson } from "@entities/Model";
import type { RadiatorJson } from "@entities/Radiator";
import { radiatorTotalTitle } from "@features/radiator/RadiatorTotalTitle";

type Props = {
  model: ModelJson;
  radiator: RadiatorJson;
  showInterAxis: boolean;
};

function RadiatorRow({ model, radiator, showInterAxis }: Props) {
  const totalPrice = useStore(getRadiatorTotalCost)(model, radiator);
  const totalTitle = useStore(radiatorTotalTitle)(model, radiator);
  const shoppingCart = useStore(storeShoppingCart);
  const convectorGrillNotFit = useStore(getGrillNotFit)(model, radiator);
  const itemInRequestQnty =
    shoppingCart.items.find((item) => item.title === totalTitle)?.qnty || 0;

  const handleAddToRequest = () => {
    addToCart({
      title: totalTitle,
      price: totalPrice,
      details: `${radiator.height}x${radiator.length}x${radiator.width} / ${radiator.dt70} Вт`,
      linkSlug: `/model/${model.slug}/${radiator.slug}`,
      itemType: "radiator",
    });
  };

  return (
    <tr class="border-b border-neutral-200 py-3 text-xs font-light transition hover:bg-neutral-50">
      <td class="py-3 pl-2 flex flex-col">
        <div class="text-red-600 font-normal hover:underline">
          <a href={`/model/${model.slug}/${radiator.slug}`}>{totalTitle}</a>
        </div>
        <div class="text-[10px] text-neutral-600 md:hidden">
          {radiator.height}
          <span class="text-[8px] font-thin">x</span>
          {radiator.length}
          <span class="text-[8px] font-thin">x</span>
          {radiator.width} мм / {radiator.dt70} Вт
        </div>
      </td>
      <td class="py-3 text-center hidden md:table-cell lg:hidden">
        {radiator.height}
        <span class="text-xs font-thin mx-1">x</span>
        {radiator.length}
        <span class="text-xs font-thin mx-1">x</span>
        {radiator.width}
      </td>
      <td class="py-3 text-center hidden lg:table-cell">{radiator.width}</td>
      <td class="py-3 text-center hidden lg:table-cell">{radiator.height}</td>
      {showInterAxis ? (
        <td class="py-3 text-center hidden lg:table-cell">
          {radiator.n_spacing || ""}
        </td>
      ) : null}
      <td class="py-3 text-center hidden lg:table-cell">{radiator.length}</td>
      <td class="py-3 text-center hidden md:table-cell">{radiator.dt70}</td>
      {convectorGrillNotFit ? (
        <td class="py-3 text-neutral-600" colSpan={2}>
          решетка не подходит
        </td>
      ) : (
        <>
          <td class="py-3">{totalPrice.toLocaleString("ru-RU")}</td>
          <td class="py-2 text-right">
            <button
              type="button"
              class="inline-flex h-7 items-center justify-center rounded-[3px] border border-red-200 bg-white px-2.5 text-xs font-normal text-red-700 transition hover:border-red-700 hover:bg-red-50"
              onClick={handleAddToRequest}
            >
              {itemInRequestQnty > 0 ? `В запросе: ${itemInRequestQnty}` : "В запрос"}
            </button>
          </td>
        </>
      )}
    </tr>
  );
}

export default RadiatorRow;
