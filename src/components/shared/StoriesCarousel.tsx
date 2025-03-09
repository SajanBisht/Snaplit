
import { useSwipeable } from "react-swipeable";
//import { ScrollArea } from "@/components/ui/scroll-area"; // Optional: Use a UI component for smooth scrolling

const users = [
  { id: 1, name: "Alice", img: "/assets/user1.jpg", hasStory: true },
  { id: 2, name: "Bob", img: "/assets/user2.jpg", hasStory: false },
  { id: 3, name: "Charlie", img: "/assets/user3.jpg", hasStory: true },
  { id: 4, name: "David", img: "/assets/user4.jpg", hasStory: true },
  { id: 5, name: "Eve", img: "/assets/user5.jpg", hasStory: false },
  { id: 6, name: "Frank", img: "/assets/user6.jpg", hasStory: true },
];

const StoriesCarousel = () => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => scroll("right"),
    onSwipedRight: () => scroll("left"),
    trackMouse: true,
  });

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("stories-container");
    if (container) {
      const scrollAmount = 150; // Adjust based on preference
      container.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full max-w-full px-4 overflow-hidden">
      {/* Swipeable area */}
      <div {...swipeHandlers}>
        <div
          id="stories-container"
          className="flex space-x-4 overflow-x-scroll no-scrollbar scroll-smooth"
        >
          {users.map((user) => (
            <div key={user.id} className="relative cursor-pointer">
              {/* Story Indicator */}
              <div
                className={`w-16 h-16 rounded-full border-2 p-1 ${
                  user.hasStory ? "border-red-500" : "border-gray-600"
                }`}
              >
                <img
                  src={user.img}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {/* Username */}
              <p className="text-xs text-gray-300 text-center mt-1">{user.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesCarousel;
