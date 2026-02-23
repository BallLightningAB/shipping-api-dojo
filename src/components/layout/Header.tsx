import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	FolderOpen,
	Menu,
	Settings,
	Shield,
	Swords,
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

const navLinks = [
	{ href: "/learn/rest", label: "REST", icon: BookOpen },
	{ href: "/learn/soap", label: "SOAP", icon: BookOpen },
	{ href: "/arena", label: "Arena", icon: Swords },
	{ href: "/wiki", label: "Wiki", icon: Shield },
	{ href: "/directory", label: "Directory", icon: FolderOpen },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				{/* Logo */}
				<Link className="flex items-center gap-2" to="/">
					<img
						alt="Carrier API-Trainer"
						className="h-12 w-12"
						height={48}
						src="/logo.png"
						width={48}
					/>
					<span className="font-heading font-semibold text-lg text-bl-cream">
						API Trainer
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
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
