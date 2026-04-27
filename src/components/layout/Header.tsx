import { ClientOnly, Link } from "@tanstack/react-router";
import {
	BookOpen,
	CreditCard,
	FolderOpen,
	GitBranch,
	Menu,
	Shield,
	Swords,
	UserRound,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth/client";

const navLinks = [
	{ href: "/learn/rest", label: "REST", icon: BookOpen },
	{ href: "/learn/soap", label: "SOAP", icon: BookOpen },
	{ href: "/learn/cross-track", label: "Cross-Track", icon: GitBranch },
	{ href: "/arena", label: "Arena", icon: Swords },
	{ href: "/plans", label: "Plans", icon: CreditCard },
	{ href: "/wiki", label: "Wiki", icon: Shield },
	{ href: "/directory", label: "Directory", icon: FolderOpen },
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				{/* Logo */}
				<Link className="flex items-center gap-2" to="/">
					<img
						alt="Shipping API Dojo"
						className="h-12 w-12"
						height={48}
						src="/logo.png"
						width={48}
					/>
					<span className="font-heading font-semibold text-lg text-bl-cream">
						Shipping API Dojo
					</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-6 md:flex">
					{navLinks.map((link) => (
						<Link
							className={
								"font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
							}
							key={link.href}
							to={link.href}
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Mobile Menu */}
				<div className="flex items-center gap-3">
					<ClientOnly fallback={<AccountLink label="Sign in" />}>
						<AccountNav />
					</ClientOnly>
					<Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button size="icon" variant="ghost">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent className="w-[280px]" side="right">
							<SheetHeader>
								<SheetTitle className="text-left">Navigation Menu</SheetTitle>
								<SheetDescription className="sr-only">
									Main navigation links for mobile devices
								</SheetDescription>
							</SheetHeader>
							<nav className="mt-8 flex flex-col gap-4">
								{navLinks.map((link) => (
									<Link
										className={
											"flex items-center gap-2 font-medium text-foreground text-lg transition-colors hover:text-bl-red"
										}
										key={link.href}
										onClick={() => setMobileMenuOpen(false)}
										to={link.href}
									>
										<link.icon className="h-4 w-4" />
										{link.label}
									</Link>
								))}
								<Link
									className={
										"flex items-center gap-2 font-medium text-foreground text-lg transition-colors hover:text-bl-red"
									}
									onClick={() => setMobileMenuOpen(false)}
									to="/settings"
								>
									<UserRound className="h-4 w-4" />
									Account
								</Link>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}

function AccountLink({ label }: { label: string }) {
	return (
		<Button asChild className="hidden gap-2 sm:inline-flex" size="sm">
			<Link to="/settings">
				<UserRound className="h-4 w-4" />
				{label}
			</Link>
		</Button>
	);
}

function AccountNav() {
	const session = authClient.useSession();
	const label = session.data?.user?.id ? "Account" : "Sign in";
	return <AccountLink label={label} />;
}
