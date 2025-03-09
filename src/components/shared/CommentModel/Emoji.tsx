import { useState } from "react";
import Picker from "@emoji-mart/react"; // Emoji Picker
import data from "@emoji-mart/data"; // Emoji Data
import { Smile } from "lucide-react"; // Emoji Icon

interface EmojiProps {
  onSelect: (emoji: string) => void; // Function to pass selected emoji
}

const Emoji: React.FC<EmojiProps> = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      {/* Emoji Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-400 hover:text-white transition"
      >
        <Smile size={24} />
      </button>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-10 left-0 z-50 shadow-lg">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onSelect(emoji.native); // Pass emoji to parent component
              setShowPicker(false); // Close picker after selection
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default Emoji;
