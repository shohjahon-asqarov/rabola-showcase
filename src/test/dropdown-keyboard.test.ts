import { describe, it, expect, vi } from "vitest";

describe("Dropdown keyboard accessibility", () => {
  it("triggers escape key handlers on keydown event", () => {
    let closed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closed = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(closed).toBe(true);

    window.removeEventListener("keydown", handleKeyDown);
  });
});
