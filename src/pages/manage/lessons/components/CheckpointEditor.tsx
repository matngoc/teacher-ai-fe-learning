import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Info } from "lucide-react";
import { Button, Card, Tooltip, Modal } from "antd";
import type { Checkpoint } from "../types/checkpoint";
import { CheckpointItem } from "./CheckpointItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CheckpointEditorProps {
  initialCheckpoints?: Checkpoint[];
  onSave?: (checkpoints: Checkpoint[]) => void;
}

interface CheckpointWithId extends Checkpoint {
  uniqueId: string;
}

export function CheckpointEditor({ initialCheckpoints = [], onSave }: CheckpointEditorProps) {
  const [checkpoints, setCheckpoints] = useState<CheckpointWithId[]>(() =>
    initialCheckpoints.map((cp, idx) => ({ ...cp, uniqueId: `checkpoint-${idx}` }))
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["checkpoint-0"]));
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Sync local state when parent checkpoints change (e.g. from JSON editor)
  useEffect(() => {
    setCheckpoints(initialCheckpoints.map((cp, idx) => ({ ...cp, uniqueId: `checkpoint-${idx}` })));
  }, [initialCheckpoints]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Notify parent of changes (debounced to avoid loops)
  const notifyChange = (newCheckpoints: CheckpointWithId[]) => {
    if (onSave) {
      const checkpointsWithoutId = newCheckpoints.map(({ uniqueId, ...rest }) => rest);
      onSave(checkpointsWithoutId);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const addCheckpoint = () => {
    const newId = `checkpoint-${Date.now()}`;
    const newCheckpoint: CheckpointWithId = {
      name: `Checkpoint ${checkpoints.length + 1}`,
      type: "narrative",
      question: "",
      media_list: [],
      uniqueId: newId,
    };
    const newCheckpoints = [...checkpoints, newCheckpoint];
    setCheckpoints(newCheckpoints);
    setExpandedIds(new Set([...expandedIds, newId]));
    notifyChange(newCheckpoints);
  };

  const updateCheckpoint = (index: number, updated: Checkpoint) => {
    const newCheckpoints = [...checkpoints];
    newCheckpoints[index] = { ...updated, uniqueId: newCheckpoints[index].uniqueId };
    setCheckpoints(newCheckpoints);
    notifyChange(newCheckpoints);
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const deleteCheckpoint = () => {
    if (deleteIndex !== null) {
      const deletedId = checkpoints[deleteIndex].uniqueId;
      const newCheckpoints = checkpoints.filter((_, i) => i !== deleteIndex);
      setCheckpoints(newCheckpoints);
      const newExpanded = new Set(expandedIds);
      newExpanded.delete(deletedId);
      setExpandedIds(newExpanded);
      setDeleteIndex(null);
      notifyChange(newCheckpoints);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = checkpoints.findIndex((cp) => cp.uniqueId === active.id);
      const newIndex = checkpoints.findIndex((cp) => cp.uniqueId === over.id);

      const newCheckpoints = arrayMove(checkpoints, oldIndex, newIndex);
      setCheckpoints(newCheckpoints);
      notifyChange(newCheckpoints);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Checkpoints</h1>
              <Tooltip
                title={
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2" style={{ borderColor: "rgb(59, 130, 246)" }}></div>
                      <span className="text-sm">Viền xanh: Checkpoint CTA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2" style={{ borderColor: "rgb(234, 179, 8)" }}></div>
                      <span className="text-sm">Viền vàng: Checkpoint Narrative</span>
                    </div>
                  </div>
                }
              >
                <Info className="h-5 w-5 text-gray-500 cursor-help" />
              </Tooltip>
            </div>
            <Button onClick={addCheckpoint} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Checkpoint
            </Button>
          </div>

          <SortableContext
            items={checkpoints.map((cp) => cp.uniqueId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {checkpoints.map((checkpoint, index) => (
                <SortableCheckpointCard
                  key={checkpoint.uniqueId}
                  checkpoint={checkpoint}
                  index={index}
                  isExpanded={expandedIds.has(checkpoint.uniqueId)}
                  onToggle={() => toggleExpanded(checkpoint.uniqueId)}
                  onDelete={() => confirmDelete(index)}
                  onUpdate={(updated) => updateCheckpoint(index, updated)}
                />
              ))}
            </div>
          </SortableContext>

          {checkpoints.length === 0 && (
            <Card className="p-12 text-center" variant="borderless">
              <p className="text-gray-500 mb-4">No checkpoints yet</p>
              <Button onClick={addCheckpoint} icon={<Plus className="h-4 w-4" />}>
                Add Your First Checkpoint
              </Button>
            </Card>
          )}
        </div>

        <Modal
          open={deleteIndex !== null}
          onCancel={() => setDeleteIndex(null)}
          onOk={deleteCheckpoint}
          title="Delete Checkpoint"
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete this checkpoint? This action cannot be undone.</p>
        </Modal>
      </div>
    </DndContext>
  );
}

interface SortableCheckpointCardProps {
  checkpoint: CheckpointWithId;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updated: Checkpoint) => void;
}

function SortableCheckpointCard({
  checkpoint,
  index,
  isExpanded,
  onToggle,
  onDelete,
  onUpdate,
}: SortableCheckpointCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: checkpoint.uniqueId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '12px',
    borderLeftColor:
      checkpoint.type === "narrative" ? "hsl(var(--narrative))" : "hsl(var(--cta))",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden transition-all"
      variant="borderless"
      styles={{ body: { padding: 0, borderLeft: `8px solid ${checkpoint.type === 'narrative' ? 'rgb(234, 179, 8)' : 'rgb(59, 130, 246)'}` } }}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className="cursor-grab active:cursor-grabbing touch-none flex items-center"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-lg font-semibold">{index + 1}</span>
          <span className="font-medium">{checkpoint.name}</span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className={`px-3 py-1 rounded text-xs font-medium ${checkpoint.type === 'narrative' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
            {checkpoint.type === 'narrative' ? 'Narrative' : 'CTA'}
          </span>
          <Button
            type="text"
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            icon={<Trash2 className="h-4 w-4" />}
          />
          <div className="cursor-pointer" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="">
          <CheckpointItem checkpoint={checkpoint} onChange={onUpdate} />
        </div>
      )}
    </Card>
  );
}
