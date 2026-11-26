/**
 * The looks a course room can take, as the program builder offers them.
 *
 * Mirrors pcle_room_themes() in the plugin (includes/formats.php): the plugin
 * is the authority and refuses anything else, so a slug added here without
 * the plugin is rejected. Adding a look is a developer's job, in both places.
 */
export const ROOM_THEMES = [
  { slug: "default", label: "Default" },
  { slug: "viking", label: "Viking hall" },
  { slug: "noir", label: "Noir case files" },
  { slug: "infernal", label: "Infernal bar" },
  { slug: "tidewater", label: "Tidewater docket" },
  { slug: "estates", label: "Noble estates" },
  { slug: "fairy", label: "Fairy court" },
  { slug: "dojo", label: "Procedure dojo" },
  { slug: "orbit", label: "Orbit station" },
] as const;

export type RoomTheme = (typeof ROOM_THEMES)[number]["slug"];

export function isRoomTheme(value: string): value is RoomTheme {
  return ROOM_THEMES.some((theme) => theme.slug === value);
}
