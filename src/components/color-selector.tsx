"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
	colors: string[];
	size?: "default" | "sm" | "lg";
	defaultValue: string;
	name?: string;
	onColorSelect?: (color: string) => void;
	className?: string;
}

const colorMap = {
	"pastel-orange": "#f2ad91",
	"pastel-green": "#bde6cc",
	"pastel-blue": "#bedcf5",
	"pastel-purple": "#ddcbf2",
} as const;

export function ColorSelector(
	{ colors, size = "default", defaultValue, name, onColorSelect, className }:
		ColorSelectorProps,
) {
	const [selectedColor, setSelectedColor] = useState<string>(defaultValue);

	const handleColorSelect = (color: string) => {
		setSelectedColor(color);
		onColorSelect?.(color);
	};

	const getSizeClass = (size: "default" | "sm" | "lg") => {
		switch (size) {
			case "sm":
				return "size-4";
			case "default":
				return "size-5";
			case "lg":
				return "size-6";
			default:
				return "size-5";
		}
	};

	const getColorValue = (color: string): string => {
		return colorMap[color as keyof typeof colorMap] || color;
	};

	const sizeClass = getSizeClass(size);

	return (
		<div className={cn("flex gap-2", className)}>
			{name && (
				<input
					type="hidden"
					name={name}
					value={selectedColor}
				/>
			)}
			{colors.map((color) => {
				const colorValue = getColorValue(color);
				return (
					<div
						key={color}
						className={`${sizeClass} rounded-full cursor-pointer transition-transform duration-200 active:scale-90 ${selectedColor === color
							? "ring-2 ring-offset-2 ring-gray-400"
							: ""
							}`}
						style={{
							backgroundColor: colorValue,
							...(selectedColor === color && {
								boxShadow:
									`inset 0 0 0 2px var(--background), 0 0 0 2px ${colorValue}`,
							}),
						}}
						onClick={() => handleColorSelect(color)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleColorSelect(color);
							}
						}}
						tabIndex={0}
						role="button"
						aria-label={`Select ${color} color`}
						aria-pressed={selectedColor === color}
					/>
				);
			})}
		</div>
	);
}