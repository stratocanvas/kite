import React from 'react';
import { withRef } from '@udecode/cn';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
} from '@udecode/plate-media';
import { useEditorRef } from '@udecode/plate-core';

import { Image } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const editor = useEditorRef();
  const { props } = useMediaToolbarButton({ nodeType });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Upload the image file to your server or a cloud storage service
      const uploadedImageUrl = await uploadImage(file);

      // Insert the uploaded image URL into the editor
      editor?.insertNode({
        type: ELEMENT_IMAGE,
        url: uploadedImageUrl,
        children: [{ text: '' }],
      });
    }
  };

  return (
    <ToolbarButton ref={ref} {...props} {...rest}>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <Image />
    </ToolbarButton>
  );
});