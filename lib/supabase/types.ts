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

export type MaintenanceTask = {
  id: string;
  equipment_id: string;
  title: string;
  due_date: string;
  status: "upcoming" | "due_soon" | "overdue" | "completed";
  priority: "low" | "medium" | "high";
  completed_at: string | null;
  created_at: string;
};

export type Inspection = {
  id: string;
  equipment_id: string;
  inspector_id: string;
  status: "passed" | "failed";
  checks: Record<string, boolean>;
  notes: string | null;
  created_at: string;
};

export type EquipmentAlert = {
  id: string;
  equipment_id: string;
  reporter_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
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
      maintenance_tasks: {
        Row: MaintenanceTask;
        Insert: Omit<MaintenanceTask, "id" | "created_at" | "completed_at"> & {
          id?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<MaintenanceTask>;
        Relationships: [];
      };
      inspections: {
        Row: Inspection;
        Insert: Omit<Inspection, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Inspection>;
        Relationships: [];
      };
      equipment_alerts: {
        Row: EquipmentAlert;
        Insert: Omit<EquipmentAlert, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<EquipmentAlert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
