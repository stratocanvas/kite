"use client";
import { useEditor, EditorContent, type Editor, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from '@tiptap/extension-image'

import { Bold, List, ListOrdered, Heading as HeadingIcon, Quote as QuoteIcon, Minus, Image as ImageIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator";
import FileHandler from '@tiptap-pro/extension-file-handler'
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface TiptapProps {
  onChange?: (jsonData: any) => void;
  initValue: any;
}
const Tiptap = ({ onChange, initValue }: TiptapProps) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "text-muted-foreground min-h-[80px] max-h-[500px] w-full rounded-md border bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none overflow-auto",
      },
    },
    extensions: [
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
            class: "my-1 font-bold p-2 bg-muted text-foreground border rounded-md",
          },
        },
      }),

      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md my-2',
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          for (const file of files) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor.chain().insertContentAt(pos, {
                type: 'image',
                attrs: {
                  src: fileReader.result,
                },
              }).focus().run();
            };
          }
        },
        onPaste: (currentEditor, files, htmlContent) => {
          for (const file of files) {
            if (htmlContent) {
              console.log(htmlContent);
              return false;
            }
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                type: 'image',
                attrs: {
                  src: fileReader.result,
                },
              }).focus().run();
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

const addImage = (editor: Editor, event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    };
    reader.readAsDataURL(file);
  }

  // 이미지 선택 후 input 요소의 값을 초기화
  event.target.value = '';
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
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
          style={{ display: 'none' }}
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
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
