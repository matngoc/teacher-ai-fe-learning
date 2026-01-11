import { useState } from "react";
import type { Checkpoint } from "../types/checkpoint";
import { Input } from "antd";
import { MediaSection } from "./MediaSection";
import { TagInsertButtons } from "./TagInsertButtons";

const { TextArea } = Input;

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  onChange: (checkpoint: Checkpoint) => void;
}

export function CheckpointItem({ checkpoint, onChange }: CheckpointItemProps) {
  const [questionCursorPos, setQuestionCursorPos] = useState(0);
  const [responseCursorPos, setResponseCursorPos] = useState(0);
  const [activeTextarea, setActiveTextarea] = useState<"question" | "response" | null>(null);

  const insertTagInQuestion = (tag: string) => {
    const before = checkpoint.question.slice(0, questionCursorPos);
    const after = checkpoint.question.slice(questionCursorPos);
    const newQuestion = before + tag + after;
    onChange({ ...checkpoint, question: newQuestion });
  };

  const insertTagInResponse = (tag: string) => {
    if (!checkpoint.response_guide) return;
    const before = checkpoint.response_guide.slice(0, responseCursorPos);
    const after = checkpoint.response_guide.slice(responseCursorPos);
    const newResponse = before + tag + after;
    onChange({ ...checkpoint, response_guide: newResponse });
  };

  const questionMedia = checkpoint.media_list.filter((m) => m.type === "for_question");
  const responseMedia = checkpoint.media_list.filter((m) => m.type === "for_response");

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={checkpoint.name}
            onChange={(e) => onChange({ ...checkpoint, name: e.target.value })}
            placeholder="Checkpoint name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={checkpoint.type}
            onChange={(e) => onChange({ ...checkpoint, type: e.target.value as "narrative" | "cta" })}
            className="w-full h-10 px-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="narrative">Narrative</option>
            <option value="cta">CTA</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Question</label>
        <TextArea
          value={checkpoint.question}
          onChange={(e) => {
            onChange({ ...checkpoint, question: e.target.value });
            setQuestionCursorPos(e.target.selectionStart || 0);
          }}
          onSelect={(e) => setQuestionCursorPos((e.target as HTMLTextAreaElement).selectionStart)}
          onFocus={() => setActiveTextarea("question")}
          onBlur={() => setActiveTextarea(null)}
          placeholder="Enter question text with tags"
          className="font-mono text-sm"
          rows={5}
        />
        <TagInsertButtons
          mediaList={questionMedia}
          onInsertMedia={(id) => insertTagInQuestion(`[MEDIA:${id}]`)}
          onInsertEmotion={(emotion) => insertTagInQuestion(`<emotion type="${emotion}"/>`)}
          onInsertNextCheckpoint={() => insertTagInQuestion("<next_ckp/>")}
          isActive={activeTextarea === "question"}
        />
      </div>

      <MediaSection
        title="Question media"
        mediaList={questionMedia}
        onUpdate={(newMedia) => {
          const otherMedia = checkpoint.media_list.filter((m) => m.type !== "for_question");
          onChange({ ...checkpoint, media_list: [...otherMedia, ...newMedia] });
        }}
        mediaType="for_question"
        allMediaInCheckpoint={checkpoint.media_list}
      />

      {checkpoint.type === "cta" && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Response guide</label>
            <TextArea
              value={checkpoint.response_guide || ""}
              onChange={(e) => {
                onChange({ ...checkpoint, response_guide: e.target.value });
                setResponseCursorPos(e.target.selectionStart || 0);
              }}
              onSelect={(e) =>
                setResponseCursorPos((e.target as HTMLTextAreaElement).selectionStart)
              }
              onFocus={() => setActiveTextarea("response")}
              onBlur={() => setActiveTextarea(null)}
              placeholder="Enter response guide with tags"
              className="font-mono text-sm"
              rows={5}
            />
            <TagInsertButtons
              mediaList={responseMedia}
              onInsertMedia={(id) => insertTagInResponse(`[MEDIA:${id}]`)}
              onInsertEmotion={(emotion) => insertTagInResponse(`<emotion type="${emotion}"/>`)}
              onInsertNextCheckpoint={() => insertTagInResponse("<next_ckp/>")}
              isActive={activeTextarea === "response"}
            />
          </div>

          <MediaSection
            title="Response media"
            mediaList={responseMedia}
            onUpdate={(newMedia) => {
              const otherMedia = checkpoint.media_list.filter((m) => m.type !== "for_response");
              onChange({ ...checkpoint, media_list: [...otherMedia, ...newMedia] });
            }}
            mediaType="for_response"
            allMediaInCheckpoint={checkpoint.media_list}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Image Listening</label>
            <Input
              value={checkpoint.image_listening || ""}
              onChange={(e) => onChange({ ...checkpoint, image_listening: e.target.value })}
              placeholder="Image listening URL"
            />
            {checkpoint.image_listening && (
              <div className="mt-2 rounded-lg border overflow-hidden bg-gray-50">
                <img
                  src={checkpoint.image_listening}
                  alt="Image Listening Preview"
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const nextEl = (e.target as HTMLImageElement).nextElementSibling;
                    if (nextEl) nextEl.classList.remove("hidden");
                  }}
                />
                <div className="hidden p-4 text-center text-sm text-gray-500">
                  Failed to load image
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
