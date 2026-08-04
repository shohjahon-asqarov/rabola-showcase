import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Mock the contexts and hooks
vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe("NotificationBell Keyboard Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should close the notification dropdown when Escape key is pressed", () => {
    // Mock authenticated user
    (useAuth as any).mockReturnValue({
      user: { id: "test-user-id" },
    });

    // Mock query data
    (useQuery as any).mockReturnValue({
      data: [
        {
          id: "1",
          title: "Yangi xabar",
          message: "Salom dunyo",
          type: "info",
          is_read: false,
          created_at: new Date().toISOString(),
          related_id: null,
        },
      ],
      isLoading: false,
    });

    render(<NotificationBell />);

    // Get trigger button
    const triggerButton = screen.getByLabelText("Bildirishnomalar");
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton.getAttribute("aria-expanded")).toBe("false");

    // Click trigger button to open dropdown
    fireEvent.click(triggerButton);
    expect(triggerButton.getAttribute("aria-expanded")).toBe("true");

    // Dropdown heading should be visible
    expect(screen.getByText("Bildirishnomalar")).toBeInTheDocument();

    // Press Escape key
    fireEvent.keyDown(document, { key: "Escape" });

    // After Escape, trigger button aria-expanded should be false, and dropdown should close
    expect(triggerButton.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Bildirishnomalar")).not.toBeInTheDocument();
  });
});
