import { supabase } from "@/lib/supabase/client";

/**
 * Decrements stock of products based on an order's contents.
 * @param products Array of order items [{sku, cantidad, price_unitario}]
 */
export async function decrementStock(products: any[]) {
  for (const item of products) {
    // 1. Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('productos')
      .select('id, stock')
      .eq('sku', item.sku)
      .single();

    if (fetchError || !product) {
      console.error(`Could not find product with SKU: ${item.sku}`);
      continue;
    }

    // 2. Calculate new stock
    const newStock = Math.max(0, product.stock - item.cantidad);

    // 3. Update stock in DB
    const { error: updateError } = await supabase
      .from('productos')
      .update({ stock: newStock })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Failed to update stock for SKU: ${item.sku}`, updateError);
    }
  }
}

/**
 * Checks if a product has enough stock.
 * @param sku Product identifier
 * @param requestedQuantity Amount to check
 */
export async function checkStockAvailability(sku: string, requestedQuantity: number) {
  const { data, error } = await supabase
    .from('productos')
    .select('stock')
    .eq('sku', sku)
    .single();

  if (error || !data) return false;
  return data.stock >= requestedQuantity;
}
