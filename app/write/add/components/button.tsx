import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash } from "lucide-react";
import { useEditModeStore } from "@/store/addform";

interface FormProps {
	fields: any[];
	remove: (index: number) => void;
	index: number;
}

interface EditButtonProps {
	fields: any[]; // Adjust the type according to your actual data structure
}

interface DeleteButtonProps {
	formProps: FormProps;
	label?: string;
}

/**
 * EditButton component.
 *
 * @param {EditButtonProps} props - The props for the EditButton component.
 * @param {Array} props.fields - The fields array.
 * @returns {React.ReactElement} The rendered EditButton component.
 */
const EditButton = ({ fields }: EditButtonProps) => {
	const { editMode, setEditMode } = useEditModeStore();

	return (
		<>
			{fields.length > 0 && (
				<Button
					type="button"
					variant={editMode ? "default" : "secondary"}
					size="sm"
					onClick={() => {
						setEditMode(!editMode);
					}}
				>
					{editMode ? (
						<>
							<Check className="mr-2 h-4 w-4" /> 확인
						</>
					) : (
						<>
							<Pencil className="mr-2 h-4 w-4" /> 편집
						</>
					)}
				</Button>
			)}
		</>
	);
};

/**
 * DeleteButton component.
 *
 * @component
 * @param {DeleteButtonProps} props - The component props.
 * @param {Array} props.fields - The fields array.
 * @param {Function} props.remove - The remove function.
 * @param {number} props.index - The index of the button.
 * @param {string} props.label - The label of the button.
 * @returns {JSX.Element} The rendered DeleteButton component.
 */
const DeleteButton = ({
	formProps: { fields, remove, index },
	label,
}: DeleteButtonProps) => {
	const { editMode, setEditMode } = useEditModeStore();

	return (
		<>
			{editMode && (
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={() => {
						remove(index);
						fields.length === 1 && setEditMode(false);
					}}
				>
					<Trash className="mr-2 h-4 w-4" />
					{label && `${label} `}삭제
				</Button>
			)}
		</>
	);
};

export { EditButton, DeleteButton };
