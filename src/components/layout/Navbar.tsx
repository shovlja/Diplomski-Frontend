import * as React from "react";
import { Link } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/features/auth/AuthContext";

type NavbarProps = {
  user?: { name?: string; avatarUrl?: string };
};

function MiniAvatar({
  src,
  alt = "User",
  initials = "U",
}: {
  src?: string;
  alt?: string;
  initials?: string;
}) {
  return (
    <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{initials}</span>
      )}
    </div>
  );
}

export default function Navbar({ user }: NavbarProps) {
  const { user: authUser } = useAuth();

  // Prefer AuthContext (display_name or displayName), then optional prop, then generic
  const displayName =
    (authUser &&
      (authUser.display_name ||
        // @ts-expect-error: tolerate camelCase if your context uses it
        (authUser as any).displayName ||
        authUser.name)) ||
    user?.name ||
    "User";

  const avatarUrl =
    (authUser && (authUser as any).avatar_url) || user?.avatarUrl || undefined;

  const initials = (displayName || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-white shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]">
      <div className="mx-2 flex h-14 w-full max-w-none items-center px-2 sm:h-17 sm:px-4">
        {/* LEFT: logo */}
        <div className="flex items-center mr-3">
          <Link to="/dashboard" className="block select-none" aria-label="Go to dashboard">
            <img src={Logo} alt="PMHub" className="h-10 w-auto" />
          </Link>
        </div>

        {/* CENTER: search */}
        <div className="flex flex-1 justify-end">
          <div className="relative w-full max-w-[500px] ml-4 sm:ml-6 lg:ml-10">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              variant="outline"
              size="md"
              rounded="xl"
              placeholder="Search for anything..."
              className="pl-9"
              aria-label="Search"
            />
          </div>
        </div>

        {/* RIGHT: bell + user */}
        <div className="ml-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" rounded="full" aria-label="Notifications" className="hover:bg-zinc-200">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-zinc-200 cursor-pointer select-none">
            <MiniAvatar src={avatarUrl} alt={displayName} initials={initials} />
            <div className="hidden ml-2 leading-tight text-left sm:block">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-800">
                {displayName}
              </div>
              {/* location removed per request */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
