"use client";

import { motion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";

interface TextEffectProps {
	children: ReactNode;
	className?: string;
	as?: ElementType;
	preset?: "fade-in-blur" | "fade-in" | "slide-up";
	delay?: number;
	speedSegment?: number;
	per?: "word" | "char" | "line";
}

const presets: Record<string, Variants> = {
	"fade-in-blur": {
		hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
	"fade-in": {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.6 },
		},
	},
	"slide-up": {
		hidden: { opacity: 0, y: 24 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 0.8,
			},
		},
	},
};

export function TextEffect({
	children,
	className,
	as: Component = "p",
	preset = "fade-in",
	delay = 0,
}: TextEffectProps) {
	const variants = presets[preset] || presets["fade-in"];
	const MotionComponent = motion.create(Component);

	const visibleVariant = variants.visible as Record<string, unknown>;
	const visibleTransition = (visibleVariant.transition ?? {}) as Record<
		string,
		unknown
	>;

	return (
		<MotionComponent
			animate="visible"
			className={className}
			initial="hidden"
			variants={{
				...variants,
				visible: {
					...visibleVariant,
					transition: {
						...visibleTransition,
						delay,
					},
				},
			}}
		>
			{children}
		</MotionComponent>
	);
}
