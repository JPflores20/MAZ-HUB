import React from "react";

// Optimization: Prevents massive re-renders of hidden tabs by skipping reconciliation
export const TabContainer = React.memo(
  ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => {
    return <div className={isActive ? "block" : "hidden"}>{children}</div>;
  },
  (prev, next) => {
    // If the tab is hidden and remains hidden, skip re-rendering its entire tree.
    // When it becomes active again, it will re-render with the latest props.
    if (!prev.isActive && !next.isActive) return true;
    return false;
  },
);
