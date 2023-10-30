import ButtonAnchorLink from "@shared/components/ButtonAnchorLink";
import { NO_PRICE } from "../constants/noPrice";

type Props = {
  minPrice: string;
};

function ModelPrice({ minPrice }: Props) {
  if (minPrice === NO_PRICE) return null;

  return (
    <div
      id="buy-now"
      class="py-5 flex flex-row gap-8 items-end justify-center"
      itemProp="offers"
      itemScope
      itemType="https://schema.org/AggregateOffer"
    >
      <meta
        itemProp="priceCurrency"
        content="RUB"
      />
      <meta
        itemProp="lowPrice"
        content={minPrice.toString()}
      />
      <div>
        <span class="text-sm">цена от:</span>
        <span class="mx-2 text-4xl text-neutral-900">
          {parseInt(minPrice).toLocaleString("ru-RU")}
        </span>
        <span class="text-small">&#8381;</span>
      </div>
      <ButtonAnchorLink
        title="Купить"
        anchor="#radiators-list"
      />
    </div>
  );
}

export default ModelPrice;
