import { SignOutButton } from "@/components/sign-out-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type AppHeaderProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    login?: string | null
  }
}

function initials(value: string) {
  return value.slice(0, 2).toUpperCase()
}

export function AppHeader({ user }: AppHeaderProps) {
  const label = user.login || user.name || user.email || "Signed in"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium tracking-tight text-foreground">
          NetGoat PM
        </p>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Shared board for agents and humans
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {user.image ? <AvatarImage src={user.image} alt={label} /> : null}
            <AvatarFallback>{initials(label)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {label}
          </span>
        </div>
        <SignOutButton />
      </div>
    </header>
  )
}
