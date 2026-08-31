export const ORDER_SELECT = `
  *,
  order_items(
    *,
    variant:product_variants(
      *,
      product:products(*),
      shape:shapes(*),
      length:lengths(*),
      finish:finishes(*)
    )
  )
`;
