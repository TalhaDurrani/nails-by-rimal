import { supabase } from "@/lib/supabase/client";

export interface GiftPacking {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateGiftPackingData {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_active?: boolean;
}

export interface UpdateGiftPackingData extends Partial<CreateGiftPackingData> {
  updated_at?: string;
}

export const adminGiftPackingService = {
  /**
   * Get all gift packing options
   */
  async getAllGiftPackings(): Promise<GiftPacking[]> {
    try {
      const { data, error } = await supabase
        .from("gift_packing")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching gift packings:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get gift packings:", err);
      return [];
    }
  },

  /**
   * Get gift packing by ID
   */
  async getGiftPackingById(id: string): Promise<GiftPacking | null> {
    try {
      const { data, error } = await supabase
        .from("gift_packing")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching gift packing:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Failed to get gift packing:", err);
      return null;
    }
  },

  /**
   * Create a new gift packing option
   */
  async createGiftPacking(giftPackingData: CreateGiftPackingData): Promise<GiftPacking> {
    try {
      const { data, error } = await supabase
        .from("gift_packing")
        .insert({
          name: giftPackingData.name,
          description: giftPackingData.description || null,
          price: giftPackingData.price,
          image_url: giftPackingData.image_url || null,
          is_active: giftPackingData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating gift packing:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create gift packing:", err);
      throw err;
    }
  },

  /**
   * Update a gift packing option
   */
  async updateGiftPacking(id: string, giftPackingData: UpdateGiftPackingData): Promise<GiftPacking> {
    try {
      const { data, error } = await supabase
        .from("gift_packing")
        .update({
          ...giftPackingData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating gift packing:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update gift packing:", err);
      throw err;
    }
  },

  /**
   * Delete a gift packing option
   */
  async deleteGiftPacking(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("gift_packing")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting gift packing:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete gift packing:", err);
      throw err;
    }
  },

  /**
   * Toggle gift packing active status
   */
  async toggleGiftPackingActive(id: string, isActive: boolean): Promise<GiftPacking> {
    try {
      const { data, error } = await supabase
        .from("gift_packing")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling gift packing active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle gift packing active status:", err);
      throw err;
    }
  },
};
