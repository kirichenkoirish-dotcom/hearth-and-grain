// Пока только внешний вид. Класть блюдо в корзину кнопка начнёт на этапе 4.
export function AddToCartButton({
  dishName,
  isAvailable,
}: {
  dishName: string;
  isAvailable: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!isAvailable}
      aria-label={`Add ${dishName} to cart`}
      className="btn-roast font-display rounded-full px-[30px] py-2.5 text-base leading-none font-medium tracking-[0.32px]"
    >
      {isAvailable ? "Add to cart" : "Sold out"}
    </button>
  );
}
