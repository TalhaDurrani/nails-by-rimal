import { supabase } from "@/lib/supabase/client";

export interface BoxOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateBoxOptionData {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_active?: boolean;
}

export interface UpdateBoxOptionData extends Partial<CreateBoxOptionData> {
  updated_at?: string;
}

export const adminBoxOptionsService = {
  /**
   * Get all box options
   */
  async getAllBoxOptions(): Promise<BoxOption[]> {
    try {
      const { data, error } = await supabase
        .from("box_options")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching box options:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get box options:", err);
      return [];
    }
  },

  /**
   * Get box option by ID
   */
  async getBoxOptionById(id: string): Promise<BoxOption | null> {
    try {
      const { data, error } = await supabase
        .from("box_options")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching box option:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Failed to get box option:", err);
      return null;
    }
  },

  /**
   * Create a new box option
   */
  async createBoxOption(boxOptionData: CreateBoxOptionData): Promise<BoxOption> {
    try {
      const { data, error } = await supabase
        .from("box_options")
        .insert({
          name: boxOptionData.name,
          description: boxOptionData.description || null,
          price: boxOptionData.price,
          image_url: boxOptionData.image_url || null,
          is_active: boxOptionData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating box option:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create box option:", err);
      throw err;
    }
  },

  /**
   * Update a box option
   */
  async updateBoxOption(id: string, boxOptionData: UpdateBoxOptionData): Promise<BoxOption> {
    try {
      const { data, error } = await supabase
        .from("box_options")
        .update({
          ...boxOptionData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating box option:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update box option:", err);
      throw err;
    }
  },

  /**
   * Delete a box option
   */
  async deleteBoxOption(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("box_options")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting box option:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete box option:", err);
      throw err;
    }
  },

  /**
   * Toggle box option active status
   */
  async toggleBoxOptionActive(id: string, isActive: boolean): Promise<BoxOption> {
    try {
      const { data, error } = await supabase
        .from("box_options")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling box option active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle box option active status:", err);
      throw err;
    }
  },
};
