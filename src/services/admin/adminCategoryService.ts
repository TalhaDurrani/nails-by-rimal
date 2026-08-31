import { supabase } from "@/lib/supabase/client";

export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  parent_id?: number | null;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  updated_at?: string;
}

export const adminCategoryService = {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get categories:", err);
      return [];
    }
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching category:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Failed to get category:", err);
      return null;
    }
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          parent_id: categoryData.parent_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating category:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create category:", err);
      throw err;
    }
  },

  /**
   * Update a category
   */
  async updateCategory(id: number, categoryData: UpdateCategoryData): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          ...categoryData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  },
};
