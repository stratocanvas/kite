import { Badge } from "@/components/ui/badge";
import { useFormContext } from "react-hook-form";

interface ItemBadgeProps {
	field: {
		name: string;
	};
}

const RequiredBadge: React.FC<ItemBadgeProps> = ({ field }) => {
	const { getFieldState } = useFormContext();
	const invalid = getFieldState(field.name).invalid;
	const empty = !getFieldState(field.name).isDirty || !getFieldState(field.name).isTouched;

	return (
		<>
			<Badge variant={invalid && empty ? "destructive" : "secondary"}>
				필수
			</Badge>
		</>
	);
};

export { RequiredBadge };
