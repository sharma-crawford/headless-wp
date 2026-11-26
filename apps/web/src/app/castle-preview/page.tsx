import { redirect } from "next/navigation";

// Old preview bookmarks land on the real castle route.
export default function CastlePreviewRedirect() {
  redirect("/castle");
}
