import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CommentList from "./CommentList";

interface CommentModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ postId, isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null); // Reference for dynamic height calculation
    const [height, setHeight] = useState(70); // Default height in percentage
    const minHeight = 15;
    const maxHeight = 70;

    // Disable background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none"; // Prevent touch scrolling on mobile
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = ""; 
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isOpen]);

    // Dynamically update drag constraints
    const getDragConstraints = () => {
        if (!modalRef.current) return { top: 0, bottom: 0 };
        const modalHeight = modalRef.current.clientHeight;
        return { top: -(modalHeight - (minHeight / 100) * window.innerHeight), bottom: 0 };
    };

    const handleClose = () => {
        setHeight(70); // Reset height when closing
        onClose();
    };

    if (!isOpen) return null; // Don't render when closed

    return (
        <div className="fixed inset-0 flex items-end justify-center bg-black/50 w-full z-[1100]" onClick={handleClose}>
            <motion.div
                ref={modalRef}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
                className="fixed bottom-0 left-0 w-full bg-[#181818] shadow-lg md:rounded-t-3xl overflow-hidden flex flex-col rounded-t-xl"
                style={{ height: `${height}vh` }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle + Header */}
                <motion.div
                    className="w-full bg-gray-700 cursor-row-resize flex flex-col items-center rounded-t-3xl"
                    drag="y"
                    dragElastic={0.2}
                    dragConstraints={getDragConstraints()}
                    onDrag={(_event, info) => {
                        setHeight((prevHeight) => {
                            const deltaHeight = (-info.delta.y / window.innerHeight) * 100;
                            return Math.max(minHeight, Math.min(maxHeight, prevHeight + deltaHeight));
                        });
                    }}
                >
                    <div className="w-12 h-1 bg-gray-400 rounded-full my-2"></div>
                </motion.div>

                {/* Header */}
                <div className="w-full flex justify-between items-center px-4 py-2 bg-[#181818] border-b border-gray-600">
                    <h2 className="text-lg font-bold text-white">Comments</h2>
                    <Button onClick={handleClose} className="text-gray-300">Close</Button>
                </div>

                {/* Comment List */}
                <div className={` ${height<21?'hidden':'block h-full overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-900 w-full'}`}>
                    <CommentList postId={postId} />
                </div>
            </motion.div>
        </div>
    );
};

export default CommentModal;
