/**
 * @fileoverview Hook powering the in-memory Ctrl+K / Cmd+K global command palette search.
 * Delegates record indexing to pure builder functions with zero extra Firestore reads.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/auth_context";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  append_directory_search_items,
  append_pdca_search_items,
  append_rda_search_items,
  type SearchCategory,
  type SearchResultItem,
} from "./global_search_builders";

/**
 * Manages global Ctrl/Cmd+K dialog open state, query text, category filter, and top 20 matches.
 */
export function useGlobalSearch() {
  const navigate = useNavigate();
  const { currentUser, permissions } = useAuth();
  const { allPdcas } = usePdcas();
  const { allRdas } = useRdas();
  const { directory } = useDirectoryUsers();

  const [is_open, set_is_open] = useState(false);
  const [search_query, set_search_query] = useState("");
  const [selected_category, set_selected_category] = useState<SearchCategory>("ALL");

  const is_admin = currentUser?.role === "admin";

  useEffect(() => {
    const handle_keydown = (keyboard_event: KeyboardEvent) => {
      if (
        (keyboard_event.ctrlKey || keyboard_event.metaKey) &&
        keyboard_event.key.toLowerCase() === "k"
      ) {
        keyboard_event.preventDefault();
        set_is_open((previous_open) => !previous_open);
      }
    };
    window.addEventListener("keydown", handle_keydown);
    return () => window.removeEventListener("keydown", handle_keydown);
  }, []);

  const indexed_items = useMemo<SearchResultItem[]>(() => {
    const collected_items: SearchResultItem[] = [];
    const navigate_and_close = (route_path: "/" | "/rda" | "/dashboard") => {
      set_is_open(false);
      void navigate({ to: route_path });
    };

    append_pdca_search_items({
      all_pdcas: allPdcas,
      current_user: currentUser,
      permissions,
      on_navigate: navigate_and_close,
      collected_items,
    });

    append_rda_search_items({
      all_rdas: allRdas,
      current_user: currentUser,
      permissions,
      on_navigate: navigate_and_close,
      collected_items,
    });

    append_directory_search_items({
      directory,
      is_admin,
      on_open_user_settings: (target_uid) => {
        set_is_open(false);
        void navigate({
          to: "/configuracion",
          search: { uid: target_uid } as Record<string, string> as never,
        });
      },
      on_navigate_dashboard: () => navigate_and_close("/dashboard"),
      collected_items,
    });

    return collected_items;
  }, [allPdcas, allRdas, directory, currentUser, permissions, is_admin, navigate]);

  const filtered_results = useMemo(() => {
    const normalized_query = search_query.trim().toLowerCase();
    return indexed_items
      .filter((result_item) => {
        if (selected_category !== "ALL" && result_item.category !== selected_category) {
          return false;
        }
        if (!normalized_query) {
          return true;
        }
        return (
          result_item.title.toLowerCase().includes(normalized_query) ||
          result_item.subtitle.toLowerCase().includes(normalized_query) ||
          result_item.badgeText.toLowerCase().includes(normalized_query)
        );
      })
      .slice(0, 20);
  }, [indexed_items, search_query, selected_category]);

  return {
    is_open,
    set_is_open,
    search_query,
    set_search_query,
    selected_category,
    set_selected_category,
    filtered_results,
  };
}
