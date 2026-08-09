import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationBell from "../components/NotificationBell";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock AuthContext
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
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }),
  },
}));

describe("NotificationBell Keyboard Accessibility", () => {
  it("closes the notification dropdown when Escape key is pressed", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    const bellButton = screen.getByRole("button", { name: "Bildirishnomalar" });
    expect(bellButton).toBeInTheDocument();
    expect(bellButton).toHaveAttribute("aria-expanded", "false");

    // Click to open
    fireEvent.click(bellButton);
    expect(bellButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Bildirishnomalar")).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: "Escape" });
    expect(bellButton).toHaveAttribute("aria-expanded", "false");
  });
});
