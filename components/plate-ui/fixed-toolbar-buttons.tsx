import React from 'react';
import {
  MARK_BOLD
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';

import { Bold, Link, Italic, Underline, Strikethrough, Code } from 'lucide-react';

import { InsertDropdownMenu } from './insert-dropdown-menu';
import { MarkToolbarButton } from './mark-toolbar-button';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';
import { LinkToolbarButton } from './link-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup noSeparator>
              <InsertDropdownMenu />
              <TurnIntoDropdownMenu />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton tooltip="굵게 (⌘+B)" nodeType={MARK_BOLD}>
                <Bold />
              </MarkToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup>
              <LinkToolbarButton />
              <MediaToolbarButton />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

      </div>
    </div>
  );
}
