import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Modal } from "antd";
import type { Media, MediaType } from "../types/checkpoint";
import { MediaCard } from "./MediaCard";
import { MediaFormDialog } from "./MediaFormDialog";
import { toast } from "react-toastify";

interface MediaSectionProps {
  title: string;
  mediaList: Media[];
  onUpdate: (mediaList: Media[]) => void;
  mediaType: MediaType;
  allMediaInCheckpoint: Media[];
}

export function MediaSection({ 
  title, 
  mediaList, 
  onUpdate, 
  mediaType, 
  allMediaInCheckpoint 
}: MediaSectionProps) {
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
      const newList = mediaList.filter((_, i) => i !== deleteIndex);
      onUpdate(newList);
      setDeleteIndex(null);
    }
  };

  const handleSave = (media: Media) => {
    // Check for duplicate ID in the entire checkpoint
    const isDuplicate = allMediaInCheckpoint.some((m, idx) => {
      // If editing, exclude the current media being edited
      if (editingIndex !== null) {
        const currentMedia = mediaList[editingIndex];
        if (m.id === currentMedia?.id && m.type === currentMedia?.type) {
          return false;
        }
      }
      return m.id === media.id;
    });

    if (isDuplicate) {
      toast.error(`Media ID "${media.id}" already exists in this checkpoint. Please choose a different ID.`);
      return;
    }

    if (editingIndex !== null) {
      const newList = [...mediaList];
      newList[editingIndex] = { ...media, type: mediaType };
      onUpdate(newList);
    } else {
      onUpdate([...mediaList, { ...media, type: mediaType }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium">{title}</label>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {mediaList.map((media, index) => (
          <MediaCard
            key={index}
            media={media}
            onEdit={() => handleEdit(index)}
            onDelete={() => confirmDelete(index)}
          />
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors gap-1"
        >
          <Plus className="h-6 w-6 text-gray-400" />
          <span className="text-xs text-gray-500">Add media</span>
        </button>
      </div>

      <MediaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        media={editingIndex !== null ? mediaList[editingIndex] : undefined}
        mediaType={mediaType}
        onSave={handleSave}
        existingIds={allMediaInCheckpoint.map((m) => m.id)}
      />

      <Modal
        open={deleteIndex !== null}
        onCancel={() => setDeleteIndex(null)}
        onOk={handleDelete}
        title="Delete Media"
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this media? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
