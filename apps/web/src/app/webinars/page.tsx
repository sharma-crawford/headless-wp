import { redirect } from "next/navigation";

/**
 * The webinars hub (P17) no longer has a page of its own. A webinar is a course:
 * it is in the Library like any other, and the live sessions a reader has coming
 * up are on My Training. Old links and reminder emails land there.
 */
export default function WebinarsPage() {
  redirect("/my-training");
}
