import { supabase } from "@/lib/supabase/client";

export interface Shape {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Length {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Finish {
  id: number;
  name: string;
  swatch_hex: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateShapeData {
  name: string;
  is_active?: boolean;
}

export interface CreateLengthData {
  name: string;
  is_active?: boolean;
}

export interface CreateFinishData {
  name: string;
  swatch_hex?: string | null;
  is_active?: boolean;
}

export type VariantType = "shapes" | "lengths" | "finishes";

export const adminVariantService = {
  /**
   * Get all shapes
   */
  async getAllShapes(): Promise<Shape[]> {
    try {
      const { data, error } = await supabase
        .from("shapes")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching shapes:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get shapes:", err);
      return [];
    }
  },

  /**
   * Get all lengths
   */
  async getAllLengths(): Promise<Length[]> {
    try {
      const { data, error } = await supabase
        .from("lengths")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching lengths:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get lengths:", err);
      return [];
    }
  },

  /**
   * Get all finishes
   */
  async getAllFinishes(): Promise<Finish[]> {
    try {
      const { data, error } = await supabase
        .from("finishes")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching finishes:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get finishes:", err);
      return [];
    }
  },

  /**
   * Create a shape
   */
  async createShape(shapeData: CreateShapeData): Promise<Shape> {
    try {
      const { data, error } = await supabase
        .from("shapes")
        .insert({
          name: shapeData.name,
          is_active: shapeData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating shape:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create shape:", err);
      throw err;
    }
  },

  /**
   * Create a length
   */
  async createLength(lengthData: CreateLengthData): Promise<Length> {
    try {
      const { data, error } = await supabase
        .from("lengths")
        .insert({
          name: lengthData.name,
          is_active: lengthData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating length:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create length:", err);
      throw err;
    }
  },

  /**
   * Create a finish
   */
  async createFinish(finishData: CreateFinishData): Promise<Finish> {
    try {
      const { data, error } = await supabase
        .from("finishes")
        .insert({
          name: finishData.name,
          swatch_hex: finishData.swatch_hex || null,
          is_active: finishData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating finish:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create finish:", err);
      throw err;
    }
  },

  /**
   * Update a shape
   */
  async updateShape(id: number, shapeData: Partial<CreateShapeData>): Promise<Shape> {
    try {
      const { data, error } = await supabase
        .from("shapes")
        .update({
          ...shapeData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating shape:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update shape:", err);
      throw err;
    }
  },

  /**
   * Update a length
   */
  async updateLength(id: number, lengthData: Partial<CreateLengthData>): Promise<Length> {
    try {
      const { data, error } = await supabase
        .from("lengths")
        .update({
          ...lengthData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating length:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update length:", err);
      throw err;
    }
  },

  /**
   * Update a finish
   */
  async updateFinish(id: number, finishData: Partial<CreateFinishData>): Promise<Finish> {
    try {
      const { data, error } = await supabase
        .from("finishes")
        .update({
          ...finishData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating finish:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update finish:", err);
      throw err;
    }
  },

  /**
   * Delete a shape
   */
  async deleteShape(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("shapes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting shape:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete shape:", err);
      throw err;
    }
  },

  /**
   * Delete a length
   */
  async deleteLength(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("lengths")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting length:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete length:", err);
      throw err;
    }
  },

  /**
   * Delete a finish
   */
  async deleteFinish(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("finishes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting finish:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete finish:", err);
      throw err;
    }
  },

  /**
   * Toggle shape active status
   */
  async toggleShapeActive(id: number, isActive: boolean): Promise<Shape> {
    try {
      const { data, error } = await supabase
        .from("shapes")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling shape active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle shape active status:", err);
      throw err;
    }
  },

  /**
   * Toggle length active status
   */
  async toggleLengthActive(id: number, isActive: boolean): Promise<Length> {
    try {
      const { data, error } = await supabase
        .from("lengths")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling length active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle length active status:", err);
      throw err;
    }
  },

  /**
   * Toggle finish active status
   */
  async toggleFinishActive(id: number, isActive: boolean): Promise<Finish> {
    try {
      const { data, error } = await supabase
        .from("finishes")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling finish active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle finish active status:", err);
      throw err;
    }
  },
};
