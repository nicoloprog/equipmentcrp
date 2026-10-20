export type EquipmentCategory = "truck" | "drill" | "battery";

export type Equipment = {
  id: string;
  tag: string;
  name: string;
  category: EquipmentCategory;
  status: "healthy" | "due_soon" | "overdue" | "warranty_expiring";
  usage_value: number | null;
  usage_unit: "hours" | "miles" | "kilometers" | null;
  warranty_expiry: string | null;
  photo_path: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, "id" | "created_at" | "status"> & {
          id?: string;
          created_at?: string;
          status?: Equipment["status"];
        };
        Update: Partial<Equipment>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
