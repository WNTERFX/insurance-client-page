import { useEffect } from "react";

export default function useViewportMeta(
  content = "width=device-width, initial-scale=1, viewport-fit=cover"
) {
  useEffect(() => {
    let tag = document.querySelector('meta[name="viewport"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "viewport");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }, [content]);
}
