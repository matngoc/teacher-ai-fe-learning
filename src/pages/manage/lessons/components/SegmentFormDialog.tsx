import { useState, useEffect } from "react";
import { Modal, Input, Button, Select, Form, InputNumber } from "antd";
import { Plus, Trash2, Upload } from "lucide-react";
import type { PronounSegment, KaraokeSegment } from "../types/checkpoint";
import { TextHighlighter } from "./TextHighlighter";

const { TextArea } = Input;

interface SegmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment?: PronounSegment;
  onSave: (segment: PronounSegment) => void;
}

const CHECK_RULE_TYPES = [
  { label: "Contains OR", value: "contains_or" },
  { label: "Contains AND", value: "contains_and" },
  { label: "Exact Match", value: "exact_match" },
];

export function SegmentFormDialog({
  open,
  onOpenChange,
  segment,
  onSave,
}: SegmentFormDialogProps) {
  const [form] = Form.useForm();
  const [highlights, setHighlights] = useState<number[]>([]);
  const [karaoke, setKaraoke] = useState<KaraokeSegment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      if (segment) {
        form.setFieldsValue({
          text: segment.text,
          audio_url: segment.audio_url,
          start_msg: segment.start_msg,
          check_rule_type: segment.check_rule.type,
          check_rule_sequence: segment.check_rule.sequence,
        });
        setText(segment.text);
        setHighlights(segment.visualize.highlights);
        setKaraoke(segment.visualize.karaoke || []);
      } else {
        form.resetFields();
        setText("");
        setHighlights([]);
        setKaraoke([]);
      }
    }
  }, [segment, open, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newSegment: PronounSegment = {
        text: values.text,
        audio_url: values.audio_url,
        start_msg: values.start_msg || "",
        check_rule: {
          type: values.check_rule_type,
          sequence: values.check_rule_sequence,
        },
        visualize: {
          highlights: highlights,
          karaoke: karaoke.length > 0 ? karaoke : undefined,
        },
      };
      
      onSave(newSegment);
      onOpenChange(false);
    }).catch((error) => {
      console.log('Validation failed:', error);
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    form.setFieldValue("text", newText);
    
    // Clear highlights that exceed new text length
    setHighlights(prev => prev.filter(idx => idx < newText.length));
  };

  const addKaraokeSegment = () => {
    setKaraoke([...karaoke, { segment: "", end_time: 0 }]);
  };

  const removeKaraokeSegment = (index: number) => {
    setKaraoke(karaoke.filter((_, i) => i !== index));
  };

  const updateKaraokeSegment = (index: number, field: keyof KaraokeSegment, value: string | number) => {
    const newKaraoke = [...karaoke];
    newKaraoke[index] = { ...newKaraoke[index], [field]: value };
    setKaraoke(newKaraoke);
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      title={segment ? "Edit Segment" : "Add Segment"}
      width={800}
      okText="Save"
    >
      <Form 
        form={form} 
        layout="vertical" 
        className="space-y-4"
        onFinish={handleSubmit}
      >
        <Form.Item 
          label="Text" 
          name="text"
          rules={[{ required: true, message: "Please enter text" }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Go into the handy galley of the yatch..."
            onChange={handleTextChange}
          />
        </Form.Item>

        <Form.Item 
          label="Audio URL" 
          name="audio_url"
          rules={[{ required: true, message: "Please enter audio URL" }]}
        >
          <div className="flex gap-2">
            <Input 
              placeholder="https://api.hanatalk.space/api/minio/file/..." 
              className="flex-1"
            />
            <Button 
              icon={<Upload className="h-4 w-4" />}
              title="Upload audio file"
            />
          </div>
        </Form.Item>

        <div className="space-y-2">
          <label className="text-sm font-medium">Check Rule</label>
          <div className="grid grid-cols-2 gap-2">
            <Form.Item 
              label="Sequence" 
              name="check_rule_sequence"
              rules={[{ required: true, message: "Required" }]}
              className="mb-0"
            >
              <Input placeholder="ji" />
            </Form.Item>
            <Form.Item 
              label="Type" 
              name="check_rule_type"
              rules={[{ required: true, message: "Required" }]}
              className="mb-0"
            >
              <Select options={CHECK_RULE_TYPES} placeholder="Select type" />
            </Form.Item>
          </div>
        </div>

        <TextHighlighter
          text={text}
          selectedIndices={highlights}
          onChange={setHighlights}
        />

        <Form.Item 
          label="Start Message (Optional)" 
          name="start_msg"
        >
          <TextArea 
            rows={2} 
            placeholder="Cậu hãy nói theo thầy Jack và giữ âm i trong 3 giây nhé."
          />
        </Form.Item>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Karaoke Timing (Optional)</label>
            <Button 
              type="dashed" 
              size="small" 
              icon={<Plus className="h-4 w-4" />}
              onClick={addKaraokeSegment}
            >
              Add
            </Button>
          </div>
          {karaoke.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded">
              {karaoke.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Segment"
                    value={item.segment}
                    onChange={(e) => updateKaraokeSegment(index, "segment", e.target.value)}
                    className="flex-1"
                  />
                  <InputNumber
                    placeholder="End time (s)"
                    value={item.end_time}
                    onChange={(value) => updateKaraokeSegment(index, "end_time", value || 0)}
                    min={0}
                    step={0.1}
                    className="w-32"
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => removeKaraokeSegment(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
