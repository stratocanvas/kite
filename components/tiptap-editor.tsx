"use client";
import {
	useEditor,
	EditorContent,
	type Editor,
	BubbleMenu,
	FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
	Bold,
	List,
	ListOrdered,
	Heading as HeadingIcon,
	Quote as QuoteIcon,
	Minus,
	Image as ImageIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import imageCompression from "browser-image-compression";
import "./tiptap.css";
import { ScrollArea } from "./ui/scroll-area";

/*const compressImage = async (file: File): Promise<string> => {
  const options = {
    maxSizeMB: 1,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);

    console.log("compressed");
    return new Promise((resolve) => {
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return '';
  }
};
*/

interface TiptapProps {
	onChange?: (jsonData: any) => void;
	initValue: any;
}
const Tiptap = ({ onChange, initValue }: TiptapProps) => {
	const editor = useEditor({
		editorProps: {
			attributes: {
				class:
					"min-h-[200px] max-h-[500px] flex flex-col overflow-auto text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
			},
		},
		extensions: [
			Placeholder.configure({
				// Use a placeholder:
				placeholder: `인포 이미지를 꼭 올려주세요!
세로 길이가 8192보다 큰 이미지는 화질이 저하될 수 있습니다. 긴 인포 이미지 업로드시 주의해 주세요.`,
				emptyEditorClass: "is-editor-empty",
			}),
			StarterKit.configure({
				horizontalRule: {
					HTMLAttributes: {
						class: "my-1",
					},
				},
				bold: {
					HTMLAttributes: {
						class: "font-bold text-foreground",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal pl-4",
					},
				},
				bulletList: {
					HTMLAttributes: {
						class: "list-disc pl-4",
					},
				},
				heading: {
					levels: [3],
					HTMLAttributes: {
						class: "mt-3 mb-1 text-xl font-bold text-foreground",
					},
				},
				blockquote: {
					HTMLAttributes: {
						class:
							"my-1 font-bold p-2 bg-muted text-foreground border rounded-md",
					},
				},
			}),

			Image.configure({
				HTMLAttributes: {
					class: "rounded-md my-2",
				},
			}),
			FileHandler.configure({
				allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
				onDrop: async (currentEditor, files, pos) => {
					for (const file of files) {
						const fileReader = new FileReader();

						fileReader.readAsDataURL(file);
						fileReader.onload = () => {
							currentEditor
								.chain()
								.insertContentAt(pos, {
									type: "image",
									attrs: {
										src: fileReader.result,
									},
								})
								.focus()
								.run();
						};
					}
				},

				onPaste: (currentEditor, files, htmlContent) => {
					for (const file of files) {
						if (htmlContent) {
							// if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
							// you could extract the pasted file from this url string and upload it to a server for example
							return false;
						}

						const fileReader = new FileReader();

						fileReader.readAsDataURL(file);
						fileReader.onload = () => {
							currentEditor
								.chain()
								.insertContentAt(currentEditor.state.selection.anchor, {
									type: "image",
									attrs: {
										src: fileReader.result,
									},
								})
								.focus()
								.run();
						};
					}
				},
			}),
		],
		content: initValue,
		onUpdate({ editor }) {
			const jsonData = editor.getJSON();
			onChange?.(jsonData);
		},
	});

	return (
		<>
			{editor ? <RichTextEditorToolbar editor={editor} /> : null}
			{editor ? <BubbleMenuComponent editor={editor} /> : null}
			{editor ? <FloatingMenuComponent editor={editor} /> : null}
			<EditorContent editor={editor} />
		</>
	);
};

const addImage = async (
	editor: Editor,
	event: React.ChangeEvent<HTMLInputElement>,
) => {
	const files = event.target.files;

	if (files) {
		const pos = editor.state.selection.anchor;
		for (const file of files) {
			// const compressedImageUrl = await compressImage(file);
			// if (compressedImageUrl) {
			editor
				.chain()
				.insertContentAt(pos, {
					type: "image",
					attrs: {
						src: URL.createObjectURL(file),
					},
				})
				.focus()
				.run();
			// }
		}
	}

	// 이미지 선택 후 input 요소의 값을 초기화
	event.target.value = "";
};

const RichTextEditorToolbar = ({ editor }: { editor: Editor }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};
	return (
		<div className="border border-input bg-transparent rounded-md p-1 flex flex-row items-center gap-1">
			<Toggle
				size="sm"
				pressed={editor.isActive("bold")}
				onPressedChange={() => editor.chain().focus().toggleBold().run()}
			>
				<Bold className="h-4 w-4" />
			</Toggle>
			<Separator orientation="vertical" className="w-[1px] h-8" />

			<Toggle
				size="sm"
				pressed={editor.isActive("heading", { level: 3 })}
				onPressedChange={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
			>
				<HeadingIcon className="h-4 w-4" />
			</Toggle>

			<Toggle
				size="sm"
				pressed={editor.isActive("bulletList")}
				onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
			>
				<List className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("orderedList")}
				onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<ListOrdered className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("quote")}
				onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
			>
				<QuoteIcon className="h-4 w-4" />
			</Toggle>
			<Button
				size="icon"
				type="button"
				variant="ghost"
				className="h-9 w-9"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			>
				<Minus className="h-4 w-4" />
			</Button>
			<Separator orientation="vertical" className="w-[1px] h-8" />
			<Button
				size="icon"
				type="button"
				variant="ghost"
				className="h-9 w-9"
				onClick={handleButtonClick}
			>
				<ImageIcon className="h-4 w-4" />
				<input
					ref={fileInputRef}
					id="file-input"
					type="file"
					accept="image/*"
					multiple
					style={{ display: "none" }}
					onChange={(event) => addImage(editor, event)}
				/>
			</Button>
		</div>
	);
};

const BubbleMenuComponent = ({ editor }: { editor: Editor }) => {
	return (
		<>
			{editor && (
				<BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
					<div className="p-1 border border-input bg-background rounded-md flex flex-row items-center gap-1">
						<Toggle
							size="sm"
							pressed={editor.isActive("bold")}
							onPressedChange={() => editor.chain().focus().toggleBold().run()}
						>
							<Bold className="h-4 w-4" />
						</Toggle>
						<Separator orientation="vertical" className="w-[1px] h-8" />
						<Toggle
							size="sm"
							pressed={editor.isActive("heading", { level: 3 })}
							onPressedChange={() =>
								editor.chain().focus().toggleHeading({ level: 3 }).run()
							}
						>
							<HeadingIcon className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("bulletList")}
							onPressedChange={() =>
								editor.chain().focus().toggleBulletList().run()
							}
						>
							<List className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("orderedList")}
							onPressedChange={() =>
								editor.chain().focus().toggleOrderedList().run()
							}
						>
							<ListOrdered className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("quote")}
							onPressedChange={() =>
								editor.chain().focus().toggleBlockquote().run()
							}
						>
							<QuoteIcon className="h-4 w-4" />
						</Toggle>
					</div>
				</BubbleMenu>
			)}
		</>
	);
};

const FloatingMenuComponent = ({ editor }: { editor: Editor }) => {
	return (
		<>
			{editor && (
				<FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
					<div className="p-1 border border-input bg-background rounded-md flex flex-row items-center gap-1">
						<ToggleGroup type="single">
							<Toggle
								size="sm"
								pressed={editor.isActive("heading", { level: 3 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 3 }).run()
								}
							>
								<HeadingIcon className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								pressed={editor.isActive("bulletList")}
								onPressedChange={() =>
									editor.chain().focus().toggleBulletList().run()
								}
							>
								<List className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								pressed={editor.isActive("orderedList")}
								onPressedChange={() =>
									editor.chain().focus().toggleOrderedList().run()
								}
							>
								<ListOrdered className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								pressed={editor.isActive("quote")}
								onPressedChange={() =>
									editor.chain().focus().toggleBlockquote().run()
								}
							>
								<QuoteIcon className="h-4 w-4" />
							</Toggle>
							<Button
								size="icon"
								className="h-9 w-9"
								type="button"
								variant="ghost"
								onClick={() => editor.chain().focus().setHorizontalRule().run()}
							>
								<Minus className="h-4 w-4" />
							</Button>
						</ToggleGroup>
					</div>
				</FloatingMenu>
			)}
		</>
	);
};

export default Tiptap;
