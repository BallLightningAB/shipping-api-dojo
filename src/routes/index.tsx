import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BookOpen,
	ExternalLink,
	Shield,
	Swords,
} from "lucide-react";
import { motion } from "motion/react";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { ContinueBanner } from "@/components/progress/ContinueBanner";
import { StreakBadge, XpBadge } from "@/components/progress/ProgressWidgets";
import { generateCanonical } from "@/lib/seo/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
	head: () => ({
		links: [generateCanonical("/")],
	}),
	component: HomePage,
});

const tracks = [
	{
		title: "REST Track",
		description:
			"HTTP semantics, auth, error mapping, pagination & webhooks for carrier APIs.",
		href: "/learn/rest",
		icon: BookOpen,
		lessons: 4,
	},
	{
		title: "SOAP Track",
		description:
			"Envelopes, namespaces, WSDL/XSD, and fault handling for legacy carrier APIs.",
		href: "/learn/soap",
		icon: BookOpen,
		lessons: 3,
	},
	{
		title: "Incident Arena",
		description:
			"Realistic troubleshooting scenarios: timeouts, rate limits, SOAP faults, and silent failures.",
		href: "/arena",
		icon: Swords,
		scenarios: 5,
	},
	{
		title: "Wiki",
		description:
			"Quick-reference articles on idempotency, retry strategies, circuit breakers, and more.",
		href: "/wiki",
		icon: Shield,
	},
];

function HomePage() {
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-20 md:py-32">
				<div className="container mx-auto max-w-6xl px-4">
					<AnimatedGroup
						className="flex flex-col items-center text-center"
						variants={{
							container: {
								hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
								visible: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
									transition: { duration: 0.7 },
								},
							},
						}}
					>
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col items-center"
							initial={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.7 }}
						>
							{/* Progress badges */}
							<ClientOnly fallback={null}>
								<div className="mb-6 flex items-center gap-3">
									<XpBadge />
									<StreakBadge />
								</div>
							</ClientOnly>

							<TextEffect
								as="h1"
								className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
								preset="fade-in-blur"
							>
								Carrier{" "}
								<span className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent">
									API Trainer
								</span>
							</TextEffect>

							<TextEffect
								className="mb-8 max-w-[50ch] text-[1rem] text-muted-foreground md:text-[1.0625rem]"
								delay={0.3}
								preset="fade-in-blur"
							>
								Interactive learning for REST and SOAP carrier integration —
								lessons, drills, and incident scenarios for interview prep and
								production troubleshooting.
							</TextEffect>

							<AnimatedGroup
								className="flex flex-col gap-4 sm:flex-row md:gap-6"
								variants={{
									container: {
										hidden: { opacity: 0 },
										visible: {
											opacity: 1,
											transition: { staggerChildren: 0.1 },
										},
									},
									item: {
										hidden: { opacity: 0, y: 20 },
										visible: {
											opacity: 1,
											y: 0,
											transition: { type: "spring", bounce: 0.3 },
										},
									},
								}}
							>
								<Button
									asChild
									className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
									size="lg"
								>
									<Link to="/learn/rest">
										Start REST Track
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									asChild
									className="border-blue-200 hover:bg-blue-50"
									size="lg"
									variant="outline"
								>
									<Link to="/learn/soap">Start SOAP Track</Link>
								</Button>
							</AnimatedGroup>
						</motion.div>
					</AnimatedGroup>
				</div>
			</section>

			{/* Continue banner */}
			<ClientOnly fallback={null}>
				<section className="pb-8">
					<div className="container mx-auto max-w-6xl px-4">
						<ContinueBanner />
					</div>
				</section>
			</ClientOnly>

			{/* Track cards */}
			<section className="border-border border-t bg-background py-16 md:py-24">
				<div className="container mx-auto max-w-6xl px-4">
					<AnimatedGroup
						className="grid gap-6 md:grid-cols-2"
						variants={{
							container: {
								hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
								visible: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
									transition: {
										duration: 0.7,
										delayChildren: 0.2,
										staggerChildren: 0.1,
									},
								},
							},
							item: {
								hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
								visible: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
									transition: { type: "spring", bounce: 0.3, duration: 0.6 },
								},
							},
						}}
					>
						{tracks.map((track) => (
							<Link key={track.href} to={track.href}>
								<Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5">
									<CardHeader>
										<div className="mb-2 flex items-center gap-2">
											<track.icon className="h-5 w-5 text-blue-500" />
											<CardTitle className="font-semibold text-lg leading-tight group-hover:text-blue-500">
												{track.title}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{track.description}
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</AnimatedGroup>
				</div>
			</section>

			{/* About the Founder */}
			<section className="border-border border-t bg-background py-16 md:py-24">
				<div className="container mx-auto max-w-6xl px-4">
					<AnimatedGroup
						className="grid gap-12 md:grid-cols-2"
						variants={{
							container: {
								hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
								visible: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
									transition: {
										duration: 0.7,
									},
								},
							},
						}}
					>
						<div>
							<img
								alt="Nicolas Brulay"
								className="h-auto w-full rounded-2xl"
								height={400}
								src="/media/face_400x400.webp"
								width={400}
							/>
						</div>
						<div className="flex flex-col justify-center">
							<h2 className="mb-4 font-semibold text-3xl tracking-tight uppercase">
								NICOLAS BRULAY
							</h2>
							<p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-500">
								FOUNDER & LEAD DEVELOPER
							</p>
							<div className="space-y-4 max-w-2xl text-muted-foreground">
								<p>
									I'm a project manager and full-stack developer with over 15
									years of experience in the Shipping & Logistics industry. I've
									designed and shipped enterprise integrations for some of the
									world's largest carrier networks.
								</p>
								<p>
									This API Trainer was built to help developers master the
									quirks of carrier integrations — from modern REST webhooks to
									legacy SOAP envelopes — based on real-world production
									incidents.
								</p>
								<p>
									Currently building [Chronomation](https://chronomation.com)
									and documenting the journey on [The Builder
									Coil](https://thebuildercoil.com).
								</p>
							</div>
							<div className="mt-8 flex gap-4">
								<Button
									asChild
									className="border-border"
									size="sm"
									variant="outline"
								>
									<a href="mailto:contact@balllightning.cloud">Get in Touch</a>
								</Button>
								<Button
									asChild
									className="hover:text-blue-500 hover:bg-blue-50"
									size="sm"
									variant="ghost"
								>
									<a
										href="https://thebuildercoil.com"
										rel="noopener noreferrer"
										target="_blank"
									>
										The Builder Coil
										<ExternalLink className="ml-2 h-3 w-3" />
									</a>
								</Button>
							</div>
						</div>
					</AnimatedGroup>
				</div>
			</section>
		</div>
	);
}
