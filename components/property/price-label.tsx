interface PriceLabelProps {
  rentPrice?: number | null;
  salePrice?: number | null;
  priceType: string;
  className?: string;
}

export function PriceLabel({ rentPrice, salePrice, priceType, className }: PriceLabelProps) {
  const format = (cents: number) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const isRent = priceType === "RENT" || priceType === "RENT_OR_SALE";
  const isSale = priceType === "SALE" || priceType === "RENT_OR_SALE";

  if (!rentPrice && !salePrice) {
    return <span className={className}>Prijs n.t.b.</span>;
  }

  return (
    <span className={className}>
      {isRent && rentPrice && (
        <span>{format(rentPrice)} <span className="text-muted-foreground font-normal text-sm">/mnd</span></span>
      )}
      {priceType === "RENT_OR_SALE" && rentPrice && salePrice && (
        <span className="text-muted-foreground font-normal text-sm"> · </span>
      )}
      {isSale && salePrice && (
        <span>{format(salePrice)} <span className="text-muted-foreground font-normal text-sm">koop</span></span>
      )}
    </span>
  );
}
