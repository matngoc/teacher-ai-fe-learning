import { Pencil, Trash2, Image as ImageIcon, Music, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import type { Media } from "../types/checkpoint";
import { Button } from "antd";

interface MediaCardProps {
  media: Media;
  onEdit: () => void;
  onDelete: () => void;
}

export function MediaCard({ media, onEdit, onDelete }: MediaCardProps) {
  const hasImage = !!media.image_url;
  const hasAudio = !!media.audio_url;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="group relative aspect-square border rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="absolute inset-0 flex items-center justify-center">
        {hasImage ? (
          <img
            key={media.image_url}
            src={media.image_url}
            alt={media.id}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`flex flex-col items-center gap-1 ${hasImage ? "hidden" : ""}`}>
          {hasAudio && <Music className="h-5 w-5 text-gray-400" />}
          {!hasImage && !hasAudio && <ImageIcon className="h-5 w-5 text-gray-400" />}
          <span className="text-xs font-medium text-center px-2">{media.id}</span>
        </div>
      </div>

      {/* Play button in center when audio available */}
      {hasAudio && (
        <>
          <audio
            ref={audioRef}
            src={media.audio_url}
            onEnded={handleAudioEnded}
            className="hidden"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 z-10">
            <Button
              shape="circle"
              size="large"
              onClick={toggleAudio}
              icon={isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            />
          </div>
        </>
      )}

      {/* Media ID label on hover - bottom center, above overlay */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border shadow-lg">
          <span className="text-xs font-semibold">{media.id}</span>
        </div>
      </div>

      {/* Edit and Delete buttons */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
        <Button
          size="small"
          type="default"
          onClick={onEdit}
          icon={<Pencil className="h-3 w-3" />}
        />
        <Button
          size="small"
          danger
          onClick={onDelete}
          icon={<Trash2 className="h-3 w-3" />}
        />
      </div>

      {/* Audio indicator */}
      {hasAudio && (
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Music className="h-4 w-4 text-blue-500" />
        </div>
      )}
    </div>
  );
}
