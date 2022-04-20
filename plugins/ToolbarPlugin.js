import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { $isParentElementRTL, $isAtNodeEnd } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isCodeNode, getDefaultCodeLanguage } from "@lexical/code";

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [isRTL, setIsRTL] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const editorNodes = [
    { format: "bold", sActive: isBold },
    { format: "italic", isActive: isItalic },
    { format: "underline", isActive: isUnderline },
    { format: "strikethrough", isActive: isStrikethrough },
    { format: "code", isActive: isCode },
    { format: "left", isActive: null },
    { format: "center", isActive: null },
    { format: "right", isActive: null },
    { format: "justify", isActive: null },
  ];

  return (
    <div className="toolbar" ref={toolbarRef}>
      <>
        {editorNodes.map((node, index) => (
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, node.format);
            }}
            className={"toolbar-item spaced " + (node.isActive ? "active" : "")}
          >
            <i className={`format ${node.format}`} />
          </button>
        ))}
      </>
    </div>
  );
}
