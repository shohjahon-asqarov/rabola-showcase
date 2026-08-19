import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PostCard from "@/components/PostCard";
import { type Post } from "@/lib/mock-data";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
    profile: null,
    isAuthenticated: true,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }),
  },
}));

const mockPost: Post = {
  id: "post-1",
  title: "Test Portfolio Site",
  description: "A test description for accessibility testing",
  image: "https://example.com/image1.jpg",
  likes_count: 5,
  comments_count: 2,
  site_url: "https://example.com",
  created_at: new Date().toISOString(),
  user_id: "test-user-id",
};

describe("PostCard Accessibility", () => {
  it("renders interactive buttons with proper Uzbek ARIA labels and pressed states", () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );

    // Options button
    const optionsButton = screen.getByRole("button", { name: "Boshqa amallar" });
    expect(optionsButton).toBeInTheDocument();

    // Like button
    const likeButton = screen.getByRole("button", { name: "Yoqtirish" });
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveAttribute("aria-pressed", "false");

    // Bookmark button
    const bookmarkButton = screen.getByRole("button", { name: "Saqlash" });
    expect(bookmarkButton).toBeInTheDocument();
    expect(bookmarkButton).toHaveAttribute("aria-pressed", "false");
  });
});
