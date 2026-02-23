"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

interface AnimatedGroupProps {
	children: ReactNode;
	className?: string;
	variants?: {
		container?: Variants;
		item?: Variants;
	};
}

const defaultContainerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const defaultItemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			bounce: 0.3,
			duration: 0.8,
		},
	},
};

export function AnimatedGroup({
	children,
	className,
	variants,
}: AnimatedGroupProps) {
	const containerVariants = variants?.container ?? defaultContainerVariants;
	const itemVariants = variants?.item ?? defaultItemVariants;

	return (
		<motion.div
			animate="visible"
			className={className}
			initial="hidden"
			variants={containerVariants}
		>
			{Children.map(children, (child) => {
				if (isValidElement(child)) {
					return (
						<motion.div variants={itemVariants}>
							{cloneElement(child)}
						</motion.div>
					);
				}
				return child;
			})}
		</motion.div>
	);
}
