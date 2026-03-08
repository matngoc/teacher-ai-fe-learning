import { useState, useEffect } from "react";
import { Video, Image, Music, Smile } from "lucide-react";
import { Button, Dropdown, Menu, Tooltip } from "antd";
import type { Media } from "../types/checkpoint";
import { toast } from "react-toastify";

interface EmotionData {
  combo_name: string;
  title?: string;
}

interface TagInsertButtonsProps {
  mediaList: Media[];
  onInsertMedia: (id: string) => void;
  onInsertEmotion: (emotion: string) => void;
  onInsertNextCheckpoint: () => void;
  isActive: boolean;
}

export function TagInsertButtons({
  mediaList,
  onInsertMedia,
  onInsertEmotion,
  onInsertNextCheckpoint,
  isActive,
}: TagInsertButtonsProps) {
  const [emotions, setEmotions] = useState<EmotionData[]>([]);

  const getMediaIcon = (media: Media) => {
    const hasImage = !!media.image_url;
    const hasAudio = !!media.audio_url;
    const isGif = media.image_url?.toLowerCase().endsWith('.gif');

    if (hasAudio && !hasImage) {
      return Music;
    }
    if ((hasImage && hasAudio) || isGif) {
      return Video;
    }
    return Image;
  };

  useEffect(() => {
    fetch(
      "https://robot-api.hacknao.edu.vn/robot/api/v1/llm/combo_moods?token=b1812cb7-2513-408b-bb22-d9f91b099fbd"
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.status === 200 && Array.isArray(response.data)) {
          setEmotions(response.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch emotions:", err);
        toast.error("Failed to load emotions");
      });
  }, []);

  const emotionMenu = (
    <Menu>
      {emotions.map((emotion) => (
        <Menu.Item
          key={emotion.combo_name}
          onClick={() => onInsertEmotion(emotion.combo_name)}
        >
          {emotion.title || emotion.combo_name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {mediaList.map((media) => {
        const MediaIcon = getMediaIcon(media);
        const tooltipTitle = isActive ? undefined : "Click on the text box first to insert tags";
        
        return (
          <Tooltip key={media.id} title={tooltipTitle}>
            <Button
              type="default"
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                if (isActive) {
                  onInsertMedia(media.id);
                }
              }}
              disabled={!isActive}
              className="gap-1"
            >
              <MediaIcon className="h-3 w-3 inline-block mr-1" />
              {media.id}
            </Button>
          </Tooltip>
        );
      })}

      <Tooltip title={isActive ? undefined : "Click on the text box first to insert tags"}>
        <Dropdown overlay={emotionMenu} disabled={!isActive}>
          <Button
            type="default"
            size="small"
            disabled={!isActive}
            className="gap-1"
            onMouseDown={(e) => {
              if (!isActive) {
                e.preventDefault();
              }
            }}
          >
            <Smile className="h-3 w-3 inline-block mr-1" />
            Emotion
          </Button>
        </Dropdown>
      </Tooltip>

      <Tooltip title={isActive ? undefined : "Click on the text box first"}>
        <Button
          type="default"
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            if (isActive) {
              onInsertNextCheckpoint();
            }
          }}
          disabled={!isActive}
        >
          Next Checkpoint
        </Button>
      </Tooltip>
    </div>
  );
}
