import { useState } from "react";
import { Plus, Edit2, Trash2, Music } from "lucide-react";
import { Modal } from "antd";
import type { PronounSegment } from "../types/checkpoint";
import { SegmentFormDialog } from "./SegmentFormDialog";

interface SegmentEditorProps {
  segments: PronounSegment[];
  onUpdate: (segments: PronounSegment[]) => void;
}

export function SegmentEditor({ segments, onUpdate }: SegmentEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      const newList = segments.filter((_, i) => i !== deleteIndex);
      onUpdate(newList);
      setDeleteIndex(null);
    }
  };

  const handleSave = (segment: PronounSegment) => {
    if (editingIndex !== null) {
      const newList = [...segments];
      newList[editingIndex] = segment;
      onUpdate(newList);
    } else {
      onUpdate([...segments, segment]);
    }
    setIsDialogOpen(false);
  };

  const renderHighlights = (text: string, highlights: number[]) => {
    return text.split('').map((char, idx) => (
      <span 
        key={idx} 
        className={highlights.includes(idx) ? "bg-yellow-300 px-0.5 rounded" : ""}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium">Pronunciation Segments</label>
        <span className="text-sm text-gray-500">{segments.length} segment(s)</span>
      </div>

      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="group relative p-4 border rounded-lg hover:border-blue-400 transition-colors bg-white"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      Rule: {segment.check_rule.type} "{segment.check_rule.sequence}"
                    </span>
                  </div>
                  <div className="text-sm font-mono leading-relaxed">
                    {renderHighlights(segment.text, segment.visualize.highlights)}
                  </div>
                  {segment.start_msg && (
                    <div className="text-xs text-gray-600 italic">
                      💬 {segment.start_msg}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Music className="h-3 w-3" />
                    <span className="truncate max-w-[300px]" title={segment.audio_url}>
                      {segment.audio_url}
                    </span>
                  </div>
                  {segment.visualize.karaoke && segment.visualize.karaoke.length > 0 && (
                    <div className="text-xs text-purple-600">
                      🎵 {segment.visualize.karaoke.length} karaoke timing(s)
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                    title="Edit segment"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(index)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-600"
                    title="Delete segment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Plus className="h-5 w-5" />
          <span>Add Segment</span>
        </button>
      </div>

      <SegmentFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        segment={editingIndex !== null ? segments[editingIndex] : undefined}
        onSave={handleSave}
      />

      <Modal
        open={deleteIndex !== null}
        onCancel={() => setDeleteIndex(null)}
        onOk={handleDelete}
        title="Delete Segment"
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this segment? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
