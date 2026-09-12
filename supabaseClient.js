// ≈⁄œ«œ«  Ê«·—»ÿ «·”Õ«»Ì „⁄ ﬁ«⁄œ… »Ì«‰«  Supabase ·„ Ã— “ÂÊ— «··Ê ”
const SUPABASE_CONFIG = {
  url: "https://virecinrnuhpbadrswjj.supabase.co",
  anonKey: "sb_publishable_7iAdh6ygHZKVb9e86xtZww_NBnEHmaY"
};

//  ÂÌ∆… «·⁄„Ì· «·”Õ«»Ì
window.LotusSupabase = {
  config: SUPABASE_CONFIG,
  
  async syncOrder(order) {
    try {
      const response = await fetch(${SUPABASE_CONFIG.url}/rest/v1/orders, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          order_id: order.orderId,
          sku: order.sku,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          is_gift: !!order.isGift,
          recipient_name: order.recipientName,
          recipient_phone: order.recipientPhone,
          gift_note: order.giftNote,
          area: order.area,
          address_details: order.addressDetails,
          delivery_slot: order.deliverySlot,
          items: order.items,
          delivery_fee: order.deliveryFee,
          total_amount: order.totalAmount,
          payment_method: order.paymentMethod,
          vodafone_sender_number: order.vodafoneSenderNumber,
          receipt_url: order.receiptUrl,
          status: order.status,
          driver_name: order.driverName,
          cancel_reason: order.cancelReason,
          cancel_notes: order.cancelNotes,
          cancelled_at: order.cancelledAt,
          cancelled_by: order.cancelledBy
        })
      });
      return response.ok;
    } catch (e) {
      console.warn('Supabase offline sync notice:', e);
      return false;
    }
  }
};
