import { useState, useEffect } from "react";
import type { Media, MediaType } from "../types/checkpoint";
import { Modal, Input, Button, Select, Form } from "antd";

const { TextArea } = Input;

interface MediaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media?: Media;
  mediaType: MediaType;
  onSave: (media: Media) => void;
  existingIds?: string[];
}

const PREDEFINED_IDS = ["img", "question", "correct", "incorrect_1", "incorrect_2"];

export function MediaFormDialog({
  open,
  onOpenChange,
  media,
  mediaType,
  onSave,
  existingIds = [],
}: MediaFormDialogProps) {
  const [form] = Form.useForm();
  const [useCustomId, setUseCustomId] = useState(false);

  useEffect(() => {
    if (open) {
      if (media) {
        form.setFieldsValue({
          id: media.id,
          image_url: media.image_url || "",
          audio_url: media.audio_url || "",
          media_description: media.media_description || "",
        });
        setUseCustomId(!PREDEFINED_IDS.includes(media.id));
      } else {
        form.resetFields();
        setUseCustomId(false);
      }
    }
  }, [media, open, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newMedia: Media = {
        id: values.id,
        type: mediaType,
        image_url: values.image_url,
        audio_url: values.audio_url,
        media_description: values.media_description,
      };
      
      // Check for duplicate
      if (existingIds.includes(newMedia.id) && newMedia.id !== media?.id) {
        form.setFields([{
          name: 'id',
          errors: ['This ID is already used']
        }]);
        return;
      }
      
      onSave(newMedia);
      onOpenChange(false);
    });
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      title={media ? "Edit Media" : "Add Media"}
      width={700}
      okText="Save"
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="ID" 
          name="id" 
          rules={[{ required: true, message: 'Please enter media ID' }]}
        >
          {!useCustomId ? (
            <Select
              placeholder="Select ID"
              onChange={(value) => {
                if (value === "custom") {
                  setUseCustomId(true);
                  form.setFieldsValue({ id: "" });
                }
              }}
            >
              {PREDEFINED_IDS.map((id) => {
                const isUsed = existingIds.includes(id) && id !== media?.id;
                return (
                  <Select.Option key={id} value={id} disabled={isUsed}>
                    {id} {isUsed && "(already used)"}
                  </Select.Option>
                );
              })}
              <Select.Option value="custom">Custom...</Select.Option>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="Enter custom ID" />
              <Button onClick={() => {
                setUseCustomId(false);
                form.setFieldsValue({ id: "" });
              }}>
                Back
              </Button>
            </div>
          )}
        </Form.Item>

        <Form.Item label="Image URL" name="image_url">
          <Input placeholder="https://example.com/image.png" />
        </Form.Item>

        {form.getFieldValue('image_url') && (
          <div className="mb-4 rounded-lg border overflow-hidden">
            <img
              src={form.getFieldValue('image_url')}
              alt="Preview"
              className="w-full h-48 object-contain bg-gray-50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <Form.Item label="Audio URL" name="audio_url">
          <Input placeholder="https://example.com/audio.mp3" />
        </Form.Item>

        {form.getFieldValue('audio_url') && (
          <div className="mb-4">
            <audio controls className="w-full">
              <source src={form.getFieldValue('audio_url')} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <Form.Item label="Description" name="media_description">
          <TextArea
            rows={3}
            placeholder="Optional description for this media..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
