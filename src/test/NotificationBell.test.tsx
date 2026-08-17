import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotificationBell from "@/components/NotificationBell";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock useAuth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    }),
  },
}));

describe("NotificationBell keyboard navigation", () => {
  it("closes the notifications popover when Escape key is pressed", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    const button = screen.getByRole("button", { name: "Bildirishnomalar" });
    expect(button.getAttribute("aria-expanded")).toBe("false");

    // Click to open
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Bildirishnomalar yo'q")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Bildirishnomalar yo'q")).not.toBeInTheDocument();
  });
});
