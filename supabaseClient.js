// Supabase Cloud Connector for Lotus Flowers EG
const SUPABASE_CONFIG = {
  url: "https://virecinrnuhpbadrswjj.supabase.co",
  anonKey: "sb_publishable_7iAdh6ygHZKVb9e86xtZww_NBnEHmaY"
};

window.LotusSupabase = {
  config: SUPABASE_CONFIG,
  async syncOrder(order) {
    if (!order || !order.orderId) return false;
    try {
      const response = await fetch(SUPABASE_CONFIG.url + "/rest/v1/orders", {
        method: "POST",
        headers: {
          "apikey": SUPABASE_CONFIG.anonKey,
          "Authorization": "Bearer " + SUPABASE_CONFIG.anonKey,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(order)
      });
      return response.ok;
    } catch (e) {
      console.warn("Supabase sync notice:", e);
      return false;
    }
  }
};
