import { Link } from "@tanstack/react-router";

const footerLinks = {
	learn: [
		{ href: "/learn/rest", label: "REST Track" },
		{ href: "/learn/soap", label: "SOAP Track" },
		{ href: "/arena", label: "Incident Arena" },
	],
	resources: [
		{ href: "/wiki", label: "Wiki" },
		{ href: "/directory", label: "Directory" },
		{ href: "/settings", label: "Settings" },
	],
};

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-border border-t bg-background">
			<div className="container mx-auto max-w-6xl px-4 py-12">
				<div className="grid gap-8 md:grid-cols-4">
					{/* Brand */}
					<div className="md:col-span-2">
						<Link className="flex items-center gap-2" to="/">
							<img
								alt="Carrier API-Trainer"
								className="h-12 w-12"
								height={48}
								src="/logo.png"
								width={48}
							/>
							<span className="font-heading font-semibold text-lg">
								API Trainer
							</span>
						</Link>
						<p className="mt-3 max-w-sm text-muted-foreground text-sm">
							Interactive carrier-integration learning for REST and SOAP
							interview prep and troubleshooting.
						</p>
					</div>

					{/* Learn Links */}
					<div>
						<h4 className="font-heading mb-3 font-semibold text-foreground text-sm">
							Learn
						</h4>
						<ul className="space-y-2">
							{footerLinks.learn.map((link) => (
								<li key={link.href}>
									<Link
										className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										to={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h4 className="font-heading mb-3 font-semibold text-foreground text-sm">
							Resources
						</h4>
						<ul className="space-y-2">
							{footerLinks.resources.map((link) => (
								<li key={link.href}>
									<Link
										className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										to={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="mt-8 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 md:flex-row">
					<p className="text-muted-foreground text-sm">
						© {currentYear} Ball Lightning AB. All rights reserved.
					</p>
					<p className="text-muted-foreground text-sm">
						A{" "}
						<a
							className="text-bl-red hover:underline"
							href="https://balllightning.cloud"
							rel="noopener noreferrer"
							target="_blank"
						>
							Ball Lightning AB
						</a>{" "}
						project
					</p>
				</div>
			</div>
		</footer>
	);
}
