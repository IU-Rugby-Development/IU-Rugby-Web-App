/**
 * Hand-authored to match supabase/migrations/*.sql.
 *
 * Once the Supabase project is live, regenerate this file for real with:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 * and re-add the domain-specific literal types (Role, GroupName, etc.)
 * from src/types/domain.ts on top of the generated string columns.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role: "MEMBER" | "EXECUTIVE" | "ADMIN";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          role?: "MEMBER" | "EXECUTIVE" | "ADMIN";
        };
        Update: {
          first_name?: string;
          last_name?: string;
          role?: "MEMBER" | "EXECUTIVE" | "ADMIN";
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: "PLAYER" | "PARENT" | "ALUMNI" | "SUPPORTER" | "SPONSOR";
          description: string | null;
        };
        Insert: {
          name: "PLAYER" | "PARENT" | "ALUMNI" | "SUPPORTER" | "SPONSOR";
          description?: string | null;
        };
        Update: {
          description?: string | null;
        };
        Relationships: [];
      };
      group_memberships: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          group_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type:
            | "GAME"
            | "PRACTICE"
            | "EVENT"
            | "FUNDRAISER"
            | "MEETING"
            | "OTHER";
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          visibility: "PUBLIC" | "MEMBERS" | "GROUPS";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          event_type:
            | "GAME"
            | "PRACTICE"
            | "EVENT"
            | "FUNDRAISER"
            | "MEETING"
            | "OTHER";
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          visibility?: "PUBLIC" | "MEMBERS" | "GROUPS";
          created_by: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          event_type?:
            | "GAME"
            | "PRACTICE"
            | "EVENT"
            | "FUNDRAISER"
            | "MEETING"
            | "OTHER";
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          visibility?: "PUBLIC" | "MEMBERS" | "GROUPS";
        };
        Relationships: [];
      };
      event_groups: {
        Row: {
          id: string;
          event_id: string;
          group_id: string;
        };
        Insert: {
          event_id: string;
          group_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      ticket_links: {
        Row: {
          id: string;
          player_id: string;
          code: string;
          destination_url: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          player_id: string;
          code: string;
          destination_url: string;
          active?: boolean;
        };
        Update: {
          destination_url?: string;
          active?: boolean;
        };
        Relationships: [];
      };
      ticket_activity: {
        Row: {
          id: string;
          ticket_link_id: string;
          event_id: string | null;
          activity_type: "CLICK" | "PURCHASE";
          created_at: string;
        };
        Insert: {
          ticket_link_id: string;
          event_id?: string | null;
          activity_type?: "CLICK" | "PURCHASE";
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      referral_leaderboard: {
        Row: {
          ticket_link_id: string;
          player_id: string;
          first_name: string;
          last_name: string;
          code: string;
          referral_clicks: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      is_executive_or_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      is_in_group: {
        Args: { uid: string; group_name: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "MEMBER" | "EXECUTIVE" | "ADMIN";
    };
    CompositeTypes: Record<string, never>;
  };
}
