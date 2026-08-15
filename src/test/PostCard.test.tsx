import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import PostCard from "@/components/PostCard";
import { type Post } from "@/lib/mock-data";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user-id" } }),
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

describe("PostCard Accessibility", () => {
  const mockPost: Post = {
    id: "post-1",
    user_id: "user-1",
    title: "Test Post Title",
    description: "Test description",
    image: null,
    created_at: new Date().toISOString(),
    likes_count: 5,
    comments_count: 2,
    profiles: {
      id: "user-1",
      firstname: "Ali",
      lastname: "Valiyev",
      profile_image: null,
    },
  };

  it("renders buttons with accessible ARIA attributes", () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const likeButton = screen.getByRole("button", { name: "Yoqdi deb belgilash" });
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveAttribute("aria-pressed", "false");

    const bookmarkButton = screen.getByRole("button", { name: "Saqlash" });
    expect(bookmarkButton).toBeInTheDocument();
    expect(bookmarkButton).toHaveAttribute("aria-pressed", "false");

    const moreButton = screen.getByRole("button", { name: "Boshqa variantlar" });
    expect(moreButton).toBeInTheDocument();
  });
});
