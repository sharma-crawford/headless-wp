"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pcle/ui/components/dropdown-menu";

import { logoutAction } from "@/app/actions/auth";
import styles from "./armory-nav.module.css";

type Item = { href: string; label: string; external?: boolean; staff?: boolean };

/**
 * The reader's own menu in the Armory header: their name, and under it what is
 * theirs (My Training, Account), then the staff paths if they have any, then Log
 * out. It replaced a row of links that repeated what the Castle's doors say.
 */
export default function AccountMenu({ name, items }: { name: string; items: Item[] }) {
  const own = items.filter((item) => !item.staff);
  const staff = items.filter((item) => item.staff);
  const font = { fontFamily: "var(--armory-font)" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.trigger} aria-label={`${name}, account menu`}>
        <span className={styles.triggerName}>{name}</span>
        <span aria-hidden="true">▾</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 text-base" style={font}>
        <DropdownMenuGroup>
          {own.map((item) => (
            <DropdownMenuItem key={item.href} className="min-h-11 text-base" render={<a href={item.href} />}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {staff.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>For staff</DropdownMenuLabel>
              {staff.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  className="min-h-11 text-base"
                  render={<a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} />}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem className="min-h-11 text-base" nativeButton render={<button type="submit" className="w-full text-left" />}>
            Log out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
