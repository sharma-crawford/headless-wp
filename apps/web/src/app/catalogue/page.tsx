import { redirect } from "next/navigation";

// The catalogue is now the Library: one list of courses and webinars, from WordPress.
export default function CataloguePage() {
  redirect("/castle#list");
}
