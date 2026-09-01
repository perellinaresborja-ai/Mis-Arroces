export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allergens: {
        Row: {
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          owner_id: string
          visitor_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          owner_id: string
          visitor_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          owner_id?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_recipes: {
        Row: {
          added_at: string
          collection_id: string
          recipe_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          recipe_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_recipes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          archived_at: string | null
          conversation_id: string
          is_pinned: boolean
          joined_at: string
          last_read_at: string
          rejected_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          conversation_id: string
          is_pinned?: boolean
          joined_at?: string
          last_read_at?: string
          rejected_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          conversation_id?: string
          is_pinned?: boolean
          joined_at?: string
          last_read_at?: string
          rejected_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      cooking_sessions: {
        Row: {
          actual_servings: number | null
          allow_comments: boolean
          calculated_density: number | null
          calculated_layer: string | null
          calculated_ratio: number | null
          calculator_version: string | null
          cooking_time_minutes: number | null
          created_at: string
          date: string
          diameter_cm: number | null
          heat_source: string | null
          id: string
          ingredient_distribution: string | null
          is_pinned: boolean
          liquid_ml: number | null
          modifications: string | null
          notes: string | null
          rating: number | null
          recipe_id: string
          reported_layer: string | null
          result_liquid: string | null
          result_texture: string | null
          rice_grams: number | null
          rice_variety_id: string | null
          scheduled_for: string | null
          socarrat_level: number | null
          status: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at: string
          user_id: string
          vessel_type_id: string | null
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          actual_servings?: number | null
          allow_comments?: boolean
          calculated_density?: number | null
          calculated_layer?: string | null
          calculated_ratio?: number | null
          calculator_version?: string | null
          cooking_time_minutes?: number | null
          created_at?: string
          date: string
          diameter_cm?: number | null
          heat_source?: string | null
          id?: string
          ingredient_distribution?: string | null
          is_pinned?: boolean
          liquid_ml?: number | null
          modifications?: string | null
          notes?: string | null
          rating?: number | null
          recipe_id: string
          reported_layer?: string | null
          result_liquid?: string | null
          result_texture?: string | null
          rice_grams?: number | null
          rice_variety_id?: string | null
          scheduled_for?: string | null
          socarrat_level?: number | null
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at?: string
          user_id: string
          vessel_type_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          actual_servings?: number | null
          allow_comments?: boolean
          calculated_density?: number | null
          calculated_layer?: string | null
          calculated_ratio?: number | null
          calculator_version?: string | null
          cooking_time_minutes?: number | null
          created_at?: string
          date?: string
          diameter_cm?: number | null
          heat_source?: string | null
          id?: string
          ingredient_distribution?: string | null
          is_pinned?: boolean
          liquid_ml?: number | null
          modifications?: string | null
          notes?: string | null
          rating?: number | null
          recipe_id?: string
          reported_layer?: string | null
          result_liquid?: string | null
          result_texture?: string | null
          rice_grams?: number | null
          rice_variety_id?: string | null
          scheduled_for?: string | null
          socarrat_level?: number | null
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at?: string
          user_id?: string
          vessel_type_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "cooking_sessions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_sessions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_sessions_rice_variety_id_fkey"
            columns: ["rice_variety_id"]
            isOneToOne: false
            referencedRelation: "rice_varieties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_sessions_vessel_type_id_fkey"
            columns: ["vessel_type_id"]
            isOneToOne: false
            referencedRelation: "vessel_types"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_hashtags: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          hashtag_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          hashtag_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          hashtag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          status: Database["public"]["Enums"]["follow_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          status?: Database["public"]["Enums"]["follow_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          status?: Database["public"]["Enums"]["follow_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string
        }
        Relationships: []
      }
      heat_sources: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      highlight_stories: {
        Row: {
          added_at: string
          display_order: number
          highlight_id: string
          story_id: string
        }
        Insert: {
          added_at?: string
          display_order?: number
          highlight_id: string
          story_id: string
        }
        Update: {
          added_at?: string
          display_order?: number
          highlight_id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlight_stories_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "story_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_aliases: {
        Row: {
          alias_name: string
          created_at: string
          id: string
          ingredient_id: string
          normalized_alias: string
        }
        Insert: {
          alias_name: string
          created_at?: string
          id?: string
          ingredient_id: string
          normalized_alias: string
        }
        Update: {
          alias_name?: string
          created_at?: string
          id?: string
          ingredient_id?: string
          normalized_alias?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_aliases_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_allergens: {
        Row: {
          allergen_id: string
          created_at: string
          ingredient_id: string
        }
        Insert: {
          allergen_id: string
          created_at?: string
          ingredient_id: string
        }
        Update: {
          allergen_id?: string
          created_at?: string
          ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_allergens_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          canonical_name: string
          carbs_g_per_100: number | null
          created_at: string
          default_grams_per_unit: number | null
          fat_g_per_100: number | null
          fiber_g_per_100: number | null
          id: string
          kcal_per_100: number | null
          normalized_name: string
          nutrition_complete: boolean | null
          nutrition_quality: string | null
          nutrition_source: string | null
          nutrition_updated_at: string | null
          protein_g_per_100: number | null
          salt_g_per_100: number | null
          saturated_fat_g_per_100: number | null
          source_food_id: string | null
          sugar_g_per_100: number | null
        }
        Insert: {
          canonical_name: string
          carbs_g_per_100?: number | null
          created_at?: string
          default_grams_per_unit?: number | null
          fat_g_per_100?: number | null
          fiber_g_per_100?: number | null
          id?: string
          kcal_per_100?: number | null
          normalized_name: string
          nutrition_complete?: boolean | null
          nutrition_quality?: string | null
          nutrition_source?: string | null
          nutrition_updated_at?: string | null
          protein_g_per_100?: number | null
          salt_g_per_100?: number | null
          saturated_fat_g_per_100?: number | null
          source_food_id?: string | null
          sugar_g_per_100?: number | null
        }
        Update: {
          canonical_name?: string
          carbs_g_per_100?: number | null
          created_at?: string
          default_grams_per_unit?: number | null
          fat_g_per_100?: number | null
          fiber_g_per_100?: number | null
          id?: string
          kcal_per_100?: number | null
          normalized_name?: string
          nutrition_complete?: boolean | null
          nutrition_quality?: string | null
          nutrition_source?: string | null
          nutrition_updated_at?: string | null
          protein_g_per_100?: number | null
          salt_g_per_100?: number | null
          saturated_fat_g_per_100?: number | null
          source_food_id?: string | null
          sugar_g_per_100?: number | null
        }
        Relationships: []
      }
      invite_referrals: {
        Row: {
          created_at: string | null
          id: string
          invited_user_id: string
          inviter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_user_id: string
          inviter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_user_id?: string
          inviter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_referrals_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_referrals_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          created_at: string
          document_type: string
          effective_at: string
          id: string
          is_active: boolean
          url: string | null
          version: string
        }
        Insert: {
          created_at?: string
          document_type: string
          effective_at?: string
          id?: string
          is_active?: boolean
          url?: string | null
          version: string
        }
        Update: {
          created_at?: string
          document_type?: string
          effective_at?: string
          id?: string
          is_active?: boolean
          url?: string | null
          version?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          deleted_at: string | null
          height: number | null
          id: string
          is_deleted: boolean
          media_type: Database["public"]["Enums"]["media_type_enum"]
          mime_type: string
          owner_id: string
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          mime_type: string
          owner_id: string
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          mime_type?: string
          owner_id?: string
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentions: {
        Row: {
          actor_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          mentioned_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          mentioned_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          mentioned_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_mentioned_id_fkey"
            columns: ["mentioned_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          id: string
          message_id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          entity_id: string | null
          id: string
          reply_to_id: string | null
          sender_id: string
          type: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id: string
          type: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          is_read: boolean
          payload: Json | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          is_read?: boolean
          payload?: Json | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          is_read?: boolean
          payload?: Json | null
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          emoji: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          display_order: number
          media_id: string
          post_id: string
        }
        Insert: {
          display_order?: number
          media_id: string
          post_id: string
        }
        Update: {
          display_order?: number
          media_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      private_share_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          resource_id: string
          resource_type: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          resource_id: string
          resource_type: string
          token?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          resource_id?: string
          resource_type?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_share_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status_enum"]
          account_type: Database["public"]["Enums"]["base_account_type_enum"]
          avatar_media_id: string | null
          bio: string | null
          cover_media_id: string | null
          created_at: string
          display_name: string | null
          id: string
          invite_code: string | null
          last_username_update: string | null
          location: string | null
          onboarding_completed: boolean | null
          privacy_level: Database["public"]["Enums"]["privacy_level_enum"]
          professional_type:
            | Database["public"]["Enums"]["professional_type_enum"]
            | null
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          account_type?: Database["public"]["Enums"]["base_account_type_enum"]
          avatar_media_id?: string | null
          bio?: string | null
          cover_media_id?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          invite_code?: string | null
          last_username_update?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          privacy_level?: Database["public"]["Enums"]["privacy_level_enum"]
          professional_type?:
            | Database["public"]["Enums"]["professional_type_enum"]
            | null
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          account_type?: Database["public"]["Enums"]["base_account_type_enum"]
          avatar_media_id?: string | null
          bio?: string | null
          cover_media_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          invite_code?: string | null
          last_username_update?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          privacy_level?: Database["public"]["Enums"]["privacy_level_enum"]
          professional_type?:
            | Database["public"]["Enums"]["professional_type_enum"]
            | null
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_avatar"
            columns: ["avatar_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_cover"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_id: string | null
          recipe_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          recipe_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredient_costs: {
        Row: {
          id: string
          owner_id: string
          purchase_amount: number | null
          purchase_price: number | null
          purchase_unit_id: string | null
          recipe_id: string
        }
        Insert: {
          id: string
          owner_id: string
          purchase_amount?: number | null
          purchase_price?: number | null
          purchase_unit_id?: string | null
          recipe_id: string
        }
        Update: {
          id?: string
          owner_id?: string
          purchase_amount?: number | null
          purchase_price?: number | null
          purchase_unit_id?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredient_costs_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "recipe_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_costs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_costs_purchase_unit_id_fkey"
            columns: ["purchase_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_costs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_costs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          canonical_ingredient_id: string | null
          created_at: string
          display_order: number
          display_text: string
          id: string
          is_scalable: boolean
          normalized_quantity: number | null
          recipe_id: string
          unit_id: string | null
        }
        Insert: {
          canonical_ingredient_id?: string | null
          created_at?: string
          display_order: number
          display_text: string
          id?: string
          is_scalable?: boolean
          normalized_quantity?: number | null
          recipe_id: string
          unit_id?: string | null
        }
        Update: {
          canonical_ingredient_id?: string | null
          created_at?: string
          display_order?: number
          display_text?: string
          id?: string
          is_scalable?: boolean
          normalized_quantity?: number | null
          recipe_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_canonical_ingredient_id_fkey"
            columns: ["canonical_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_likes: {
        Row: {
          created_at: string
          emoji: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_manual_allergens: {
        Row: {
          allergen_id: string
          created_at: string
          is_excluded: boolean
          reason: string | null
          recipe_id: string
        }
        Insert: {
          allergen_id: string
          created_at?: string
          is_excluded?: boolean
          reason?: string | null
          recipe_id: string
        }
        Update: {
          allergen_id?: string
          created_at?: string
          is_excluded?: boolean
          reason?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_manual_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_manual_allergens_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_manual_allergens_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_media: {
        Row: {
          created_at: string
          display_order: number
          is_primary: boolean
          media_id: string
          recipe_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          is_primary?: boolean
          media_id: string
          recipe_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          is_primary?: boolean
          media_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: true
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_media_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_media_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_revisions: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          revision_number: number
          snapshot: Json
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          revision_number: number
          snapshot: Json
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          revision_number?: number
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "recipe_revisions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_revisions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          instruction: string
          media_id: string | null
          notes: string | null
          recipe_id: string
          step_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instruction: string
          media_id?: string | null
          notes?: string | null
          recipe_id: string
          step_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instruction?: string
          media_id?: string | null
          notes?: string | null
          recipe_id?: string
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          created_at: string
          recipe_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_vessels: {
        Row: {
          capacity_liters: number | null
          created_at: string
          diameter_cm: number | null
          id: string
          notes: string | null
          recipe_id: string
          vessel_type_id: string
        }
        Insert: {
          capacity_liters?: number | null
          created_at?: string
          diameter_cm?: number | null
          id?: string
          notes?: string | null
          recipe_id: string
          vessel_type_id: string
        }
        Update: {
          capacity_liters?: number | null
          created_at?: string
          diameter_cm?: number | null
          id?: string
          notes?: string | null
          recipe_id?: string
          vessel_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_vessels_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_vessels_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_vessels_vessel_type_id_fkey"
            columns: ["vessel_type_id"]
            isOneToOne: false
            referencedRelation: "vessel_types"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allow_comments: boolean
          base_servings: number
          cook_time: number | null
          created_at: string
          derived_from_id: string | null
          description: string | null
          difficulty:
            | Database["public"]["Enums"]["difficulty_level_enum"]
            | null
          heat_source_id: string | null
          id: string
          is_pinned: boolean
          name: string
          owner_id: string | null
          rest_time: number | null
          rice_qty: number | null
          scheduled_for: string | null
          slug: string
          status: Database["public"]["Enums"]["recipe_status_enum"]
          stock_qty: number | null
          style_id: string | null
          updated_at: string
          variety_id: string | null
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          allow_comments?: boolean
          base_servings?: number
          cook_time?: number | null
          created_at?: string
          derived_from_id?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["difficulty_level_enum"]
            | null
          heat_source_id?: string | null
          id?: string
          is_pinned?: boolean
          name: string
          owner_id?: string | null
          rest_time?: number | null
          rice_qty?: number | null
          scheduled_for?: string | null
          slug: string
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          stock_qty?: number | null
          style_id?: string | null
          updated_at?: string
          variety_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          allow_comments?: boolean
          base_servings?: number
          cook_time?: number | null
          created_at?: string
          derived_from_id?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["difficulty_level_enum"]
            | null
          heat_source_id?: string | null
          id?: string
          is_pinned?: boolean
          name?: string
          owner_id?: string | null
          rest_time?: number | null
          rice_qty?: number | null
          scheduled_for?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          stock_qty?: number | null
          style_id?: string | null
          updated_at?: string
          variety_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "recipes_derived_from_id_fkey"
            columns: ["derived_from_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_derived_from_id_fkey"
            columns: ["derived_from_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_heat_source_id_fkey"
            columns: ["heat_source_id"]
            isOneToOne: false
            referencedRelation: "heat_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "rice_styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_variety_id_fkey"
            columns: ["variety_id"]
            isOneToOne: false
            referencedRelation: "rice_varieties"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_access_grants: {
        Row: {
          created_at: string
          granted_to_id: string
          id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string
          granted_to_id: string
          id?: string
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string
          granted_to_id?: string
          id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_access_grants_granted_to_id_fkey"
            columns: ["granted_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rice_styles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      rice_varieties: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      saves: {
        Row: {
          recipe_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          recipe_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          recipe_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "session_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_id: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "session_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cooking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_likes: {
        Row: {
          created_at: string
          emoji: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_likes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cooking_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_media: {
        Row: {
          created_at: string
          display_order: number
          is_primary: boolean
          media_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          is_primary?: boolean
          media_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          is_primary?: boolean
          media_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: true
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_media_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cooking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          created_at: string
          id: string
          ingredient_name: string
          is_checked: boolean
          list_id: string
          quantity: number | null
          recipe_id: string | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name: string
          is_checked?: boolean
          list_id: string
          quantity?: number | null
          recipe_id?: string | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name?: string
          is_checked?: boolean
          list_id?: string
          quantity?: number | null
          recipe_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      short_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "short_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      short_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_id: string | null
          short_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          short_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_id?: string | null
          short_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "short_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_comments_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts"
            referencedColumns: ["id"]
          },
        ]
      }
      short_likes: {
        Row: {
          created_at: string
          emoji: string
          short_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          short_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          short_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_likes_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      short_media: {
        Row: {
          display_order: number
          media_id: string
          short_id: string
        }
        Insert: {
          display_order?: number
          media_id: string
          short_id: string
        }
        Update: {
          display_order?: number
          media_id?: string
          short_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_media_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts"
            referencedColumns: ["id"]
          },
        ]
      }
      shorts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          owner_id: string
          recipe_id: string | null
          session_id: string | null
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          owner_id: string
          recipe_id?: string | null
          session_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          recipe_id?: string | null
          session_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "shorts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shorts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shorts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shorts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cooking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          allow_comments: boolean
          author_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          recipe_id: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          allow_comments?: boolean
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          recipe_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          allow_comments?: boolean
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          recipe_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["recipe_status_enum"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          allow_reactions: boolean
          allow_replies: boolean
          background: Json | null
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_transform: Json | null
          overlays: Json | null
          owner_id: string
          recipe_id: string | null
          session_id: string | null
          visibility: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Insert: {
          allow_reactions?: boolean
          allow_replies?: boolean
          background?: Json | null
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_transform?: Json | null
          overlays?: Json | null
          owner_id: string
          recipe_id?: string | null
          session_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Update: {
          allow_reactions?: boolean
          allow_replies?: boolean
          background?: Json | null
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_transform?: Json | null
          overlays?: Json | null
          owner_id?: string
          recipe_id?: string | null
          session_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "stories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cooking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_highlights: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_highlights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          display_order: number
          media_id: string
          story_id: string
        }
        Insert: {
          display_order?: number
          media_id: string
          story_id: string
        }
        Update: {
          display_order?: number
          media_id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_poll_votes: {
        Row: {
          created_at: string
          poll_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          poll_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          poll_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "story_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_polls: {
        Row: {
          created_at: string
          id: string
          option_a: string
          option_b: string
          question: string
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_a: string
          option_b: string
          question: string
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_a?: string
          option_b?: string
          question?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_polls_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_slider_responses: {
        Row: {
          created_at: string
          id: string
          overlay_id: string
          story_id: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          overlay_id: string
          story_id: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          overlay_id?: string
          story_id?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_slider_responses_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_slider_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          created_at: string
          id: string
          story_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tagged_users: {
        Row: {
          author_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tagged_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tagged_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tagged_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tagged_users_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tagged_users_tagged_id_fkey"
            columns: ["tagged_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          id: string
          is_scalable: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_scalable?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_scalable?: boolean
          name?: string
        }
        Relationships: []
      }
      unmatched_ingredients: {
        Row: {
          display_text: string
          first_seen_at: string
          frequency_count: number
          id: string
          last_seen_at: string
          normalized_text: string
        }
        Insert: {
          display_text: string
          first_seen_at?: string
          frequency_count?: number
          id?: string
          last_seen_at?: string
          normalized_text: string
        }
        Update: {
          display_text?: string
          first_seen_at?: string
          frequency_count?: number
          id?: string
          last_seen_at?: string
          normalized_text?: string
        }
        Relationships: []
      }
      user_legal_acceptances: {
        Row: {
          accepted_at: string
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_legal_acceptances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      username_aliases: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "username_aliases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      username_history: {
        Row: {
          changed_at: string
          id: string
          old_username: string
          profile_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          old_username: string
          profile_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          old_username?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "username_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      want_to_cook: {
        Row: {
          added_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "want_to_cook_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "want_to_cook_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "want_to_cook_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mutes: {
        Row: { id: string; muter_id: string; muted_id: string; created_at: string; }
        Insert: { id?: string; muter_id: string; muted_id: string; created_at?: string; }
        Update: { id?: string; muter_id?: string; muted_id?: string; created_at?: string; }
        Relationships: []
      }
      hidden_words: {
        Row: { id: string; user_id: string; word: string; created_at: string; }
        Insert: { id?: string; user_id: string; word: string; created_at?: string; }
        Update: { id?: string; user_id?: string; word?: string; created_at?: string; }
        Relationships: []
      }
      notification_preferences: {
        Row: { user_id: string; follows: boolean; likes: boolean; comments: boolean; mentions: boolean; messages: boolean; system: boolean; updated_at: string; }
        Insert: { user_id: string; follows?: boolean; likes?: boolean; comments?: boolean; mentions?: boolean; messages?: boolean; system?: boolean; updated_at?: string; }
        Update: { user_id?: string; follows?: boolean; likes?: boolean; comments?: boolean; mentions?: boolean; messages?: boolean; system?: boolean; updated_at?: string; }
        Relationships: []
      }
    }
    Views: {
      feed_items: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          user_id: string | null
          visibility:
            | Database["public"]["Enums"]["visibility_level_enum"]
            | null
        }
        Relationships: []
      }
      feed_metrics: {
        Row: {
          comment_count: number | null
          current_user_reaction: string | null
          entity_id: string | null
          entity_type: string | null
          grouped_reactions: Json | null
          like_count: number | null
        }
        Relationships: []
      }
      popular_recipes_v1: {
        Row: {
          allow_comments: boolean | null
          base_servings: number | null
          cook_time: number | null
          created_at: string | null
          derived_from_id: string | null
          description: string | null
          difficulty:
            | Database["public"]["Enums"]["difficulty_level_enum"]
            | null
          heat_source_id: string | null
          id: string | null
          name: string | null
          owner_id: string | null
          popularity_score: number | null
          rest_time: number | null
          rice_qty: number | null
          scheduled_for: string | null
          slug: string | null
          status: Database["public"]["Enums"]["recipe_status_enum"] | null
          stock_qty: number | null
          style_id: string | null
          updated_at: string | null
          variety_id: string | null
          visibility:
            | Database["public"]["Enums"]["visibility_level_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_derived_from_id_fkey"
            columns: ["derived_from_id"]
            isOneToOne: false
            referencedRelation: "popular_recipes_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_derived_from_id_fkey"
            columns: ["derived_from_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_heat_source_id_fkey"
            columns: ["heat_source_id"]
            isOneToOne: false
            referencedRelation: "heat_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "rice_styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_variety_id_fkey"
            columns: ["variety_id"]
            isOneToOne: false
            referencedRelation: "rice_varieties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_is_member_of_conversation: {
        Args: { conv_id: string }
        Returns: boolean
      }
      get_entity_insights: {
        Args: { entity_id_param: string; entity_type_param: string }
        Returns: Json
      }
      get_most_cooked_recipes: {
        Args: { limit_val?: number; time_filter?: string }
        Returns: {
          cook_count: number
          recipe_id: string
        }[]
      }
      get_or_create_conversation: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_profile_insights: {
        Args: { days_param: number; owner_id_param: string }
        Returns: Json
      }
      get_top_content: {
        Args: {
          days_param: number
          metric_param: string
          owner_id_param: string
        }
        Returns: Json
      }
      get_trending_recipes: {
        Args: { limit_val?: number }
        Returns: {
          recipe_id: string
          trend_score: number
        }[]
      }
      get_unread_conversations_count: { Args: never; Returns: number }
      is_blocked: { Args: { uid1: string; uid2: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      track_analytics_event: {
        Args: {
          entity_id_param: string
          entity_type_param: string
          event_type_param: string
          visitor_id_param?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status_enum: "ACTIVE" | "SUSPENDED" | "DELETED"
      base_account_type_enum: "PERSONAL" | "PROFESSIONAL"
      difficulty_level_enum: "EASY" | "MEDIUM" | "HARD"
      follow_status_enum: "PENDING" | "ACCEPTED"
      media_type_enum: "IMAGE" | "VIDEO"
      notification_type_enum:
        | "LIKE"
        | "COMMENT"
        | "REPLY"
        | "MENTION"
        | "TAG"
        | "FOLLOW"
        | "FOLLOW_REQUEST"
        | "FOLLOW_ACCEPT"
        | "COOKED_RECIPE"
        | "PUBLISHED_RESULT"
        | "NEW_MESSAGE"
      privacy_level_enum: "PUBLIC" | "PRIVATE"
      professional_type_enum:
        | "CHEF"
        | "RESTAURANT"
        | "CREATOR"
        | "BRAND"
        | "OTHER"
        | "PRODUCER"
      recipe_status_enum: "DRAFT" | "PUBLISHED"
      visibility_level_enum: "PUBLIC" | "FOLLOWERS" | "PRIVATE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status_enum: ["ACTIVE", "SUSPENDED", "DELETED"],
      base_account_type_enum: ["PERSONAL", "PROFESSIONAL"],
      difficulty_level_enum: ["EASY", "MEDIUM", "HARD"],
      follow_status_enum: ["PENDING", "ACCEPTED"],
      media_type_enum: ["IMAGE", "VIDEO"],
      notification_type_enum: [
        "LIKE",
        "COMMENT",
        "REPLY",
        "MENTION",
        "TAG",
        "FOLLOW",
        "FOLLOW_REQUEST",
        "FOLLOW_ACCEPT",
        "COOKED_RECIPE",
        "PUBLISHED_RESULT",
        "NEW_MESSAGE",
      ],
      privacy_level_enum: ["PUBLIC", "PRIVATE"],
      professional_type_enum: [
        "CHEF",
        "RESTAURANT",
        "CREATOR",
        "BRAND",
        "OTHER",
        "PRODUCER",
      ],
      recipe_status_enum: ["DRAFT", "PUBLISHED"],
      visibility_level_enum: ["PUBLIC", "FOLLOWERS", "PRIVATE"],
    },
  },
} as const

