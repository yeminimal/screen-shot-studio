import { createFileRoute } from "@tanstack/react-router";
import { SnapView } from "@/components/SnapView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnapView — See your site on any screen" },
      {
        name: "description",
        content:
          "Paste a URL, pick a device, and capture a pixel-perfect screenshot wrapped in a mockup frame.",
      },
      { property: "og:title", content: "SnapView — See your site on any screen" },
      {
        property: "og:description",
        content:
          "Paste a URL, pick a device, and capture a pixel-perfect screenshot wrapped in a mockup frame.",
      },
    ],
  }),
  component: SnapView,
});
