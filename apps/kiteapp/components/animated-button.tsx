import type React from "react";
import { motion, useDragControls } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRef } from "react";
interface AnimatedButtonProps extends ButtonProps {
	children: React.ReactNode;
}
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
	children,
	asChild,
	type = "button",
	size = undefined,
	className = undefined,
	...props
}) => {
	return (
		<div className="w-full">
			<motion.div whileTap={{ scale: 0.95 }}>
				<Button
					asChild={asChild}
					type={type}
					size={size}
					className={className}
					{...props}
				>
					{children}
				</Button>
			</motion.div>
		</div>
	);
};
export default AnimatedButton;
