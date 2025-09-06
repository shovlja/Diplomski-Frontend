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
    <header
      className="
        fixed inset-x-0 top-0 z-50
        h-14 sm:h-16
        bg-white/90 backdrop-blur
        shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]
        border-b border-zinc-200
      "
    >
      <div className="mx-2 flex h-full w-full items-center px-2 sm:px-4">
        {/* LEFT: logo */}
        <div className="mr-3 flex items-center">
          <Link to="/" className="block select-none" aria-label="Go to dashboard">
            <img src={Logo} alt="PMHub" className="h-10 w-auto" />
          </Link>
        </div>

        {/* CENTER: search */}
        <div className="flex flex-1 justify-end min-w-0">
          <div className="relative ml-4 w-full max-w-[500px] sm:ml-6 lg:ml-10">
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
          <Button variant="ghost" size="icon" rounded="full" aria-label="Notifications" className="hover:bg-zinc-200 cursor-pointer">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex select-none items-center gap-1 rounded-full px-1.5 py-1 hover:bg-zinc-200 cursor-pointer">
            <MiniAvatar src={avatarUrl} alt={displayName} initials={initials} />
            <div className="ml-2 hidden text-left leading-tight sm:block">
              <div className="text-sm font-medium text-slate-800">{displayName}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
