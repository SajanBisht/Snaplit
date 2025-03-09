import { useEffect, useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";

// Optional: More precise emoji type from emoji-mart (can be 'any' if types conflict)
interface EmojiMartEmoji {
  id: string;
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
  keywords: string[];
}

interface EmojiProps {
  onSelect: (emoji: string) => void;
}

const Emoji: React.FC<EmojiProps> = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Optional: Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="relative" ref={pickerRef}>
      {/* Emoji Button */}
      <button
        onClick={() => setShowPicker((prev) => !prev)}
        className="text-gray-400 hover:text-white transition"
        type="button"
      >
        <Smile size={24} />
      </button>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-10 left-0 z-50 shadow-lg">
          <Picker
            data={data}
            onEmojiSelect={(emoji: EmojiMartEmoji) => {
              onSelect(emoji.native);
              setShowPicker(false);
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default Emoji;
