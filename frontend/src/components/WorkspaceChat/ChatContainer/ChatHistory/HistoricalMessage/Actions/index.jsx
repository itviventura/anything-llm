import React, { memo, useState } from "react";
import useCopyText from "@/hooks/useCopyText";
import {
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowsClockwise,
  Copy,
} from "@phosphor-icons/react";
import { Tooltip } from "react-tooltip";
import Workspace from "@/models/workspace";
import { EditMessageAction } from "./EditMessage";
import ActionMenu from "./ActionMenu";

const Actions = ({
  message,
  feedbackScore,
  chatId,
  slug,
  isLastMessage,
  regenerateMessage,
  forkThread,
  isEditing,
  role,
  onBadFeedback,
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState(feedbackScore);
  const [selectedBadFeedback, setSelectedBadFeedback] = useState(false);
  const handleFeedback = async (newFeedback) => {
    const updatedFeedback =
      selectedFeedback === newFeedback ? null : newFeedback;
    await Workspace.updateChatFeedback(chatId, slug, updatedFeedback);
    setSelectedFeedback(updatedFeedback);
  };
  const handleBadFeedback = async () => {
    if (onBadFeedback) {
      await onBadFeedback(chatId);
      setSelectedBadFeedback(true);
    }
  };

  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex justify-start items-center gap-x-[8px]">
        <CopyMessage message={message} />
        <div className="md:group-hover:opacity-100 transition-all duration-300 md:opacity-0 flex justify-start items-center gap-x-[8px]">
          <EditMessageAction
            chatId={chatId}
            role={role}
            isEditing={isEditing}
          />
          {isLastMessage && !isEditing && (
            <RegenerateMessage
              regenerateMessage={regenerateMessage}
              slug={slug}
              chatId={chatId}
            />
          )}
          {chatId && role !== "user" && !isEditing && (
            <FeedbackButton
              isSelected={selectedFeedback}
              handleFeedback={() => handleFeedback(true)}
              tooltipId={`${chatId}-thumbs-up`}
              tooltipContent="Good response"
              IconComponent={ThumbsUp}
            />
          )}
          {chatId &&
            role !== "user" &&
            !isEditing &&
            onBadFeedback &&
            !selectedBadFeedback && (
              <FeedbackButton
                isSelected={selectedBadFeedback === chatId}
                disabled={selectedBadFeedback === chatId}
                handleFeedback={() => handleBadFeedback()}
                tooltipId={`${chatId}-thumbs-down`}
                tooltipContent="Bad response"
                IconComponent={ThumbsDown}
              />
            )}
          <ActionMenu
            chatId={chatId}
            forkThread={forkThread}
            isEditing={isEditing}
            role={role}
          />
        </div>
      </div>
    </div>
  );
};

function FeedbackButton({
  isSelected,
  handleFeedback,
  tooltipId,
  tooltipContent,
  IconComponent,
  disabled = false,
}) {
  return (
    <div className="mt-3 relative">
      <button
        onClick={handleFeedback}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipContent}
        className="text-zinc-300"
        aria-label={tooltipContent}
        disabled={disabled}
      >
        <IconComponent
          size={20}
          className="mb-1"
          weight={isSelected ? "fill" : "regular"}
        />
      </button>
      <Tooltip
        id={tooltipId}
        place="bottom"
        delayShow={300}
        className="tooltip !text-xs"
      />
    </div>
  );
}

function CopyMessage({ message }) {
  const { copied, copyText } = useCopyText();

  return (
    <>
      <div className="mt-3 relative">
        <button
          onClick={() => copyText(message)}
          data-tooltip-id="copy-assistant-text"
          data-tooltip-content="Copy"
          className="text-zinc-300"
          aria-label="Copy"
        >
          {copied ? (
            <Check size={20} className="mb-1" />
          ) : (
            <Copy size={20} className="mb-1" />
          )}
        </button>
        <Tooltip
          id="copy-assistant-text"
          place="bottom"
          delayShow={300}
          className="tooltip !text-xs"
        />
      </div>
    </>
  );
}

function RegenerateMessage({ regenerateMessage, chatId }) {
  if (!chatId) return null;
  return (
    <div className="mt-3 relative">
      <button
        onClick={() => regenerateMessage(chatId)}
        data-tooltip-id="regenerate-assistant-text"
        data-tooltip-content="Regenerate response"
        className="border-none text-zinc-300"
        aria-label="Regenerate"
      >
        <ArrowsClockwise size={20} className="mb-1" weight="fill" />
      </button>
      <Tooltip
        id="regenerate-assistant-text"
        place="bottom"
        delayShow={300}
        className="tooltip !text-xs"
      />
    </div>
  );
}

export default memo(Actions);
