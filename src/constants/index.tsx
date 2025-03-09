import { useUserContext } from "@/context/AuthContext";

// Function to get sidebar links dynamically
export const useSidebarLinks = () => {
  const { user } = useUserContext();

  return [
    {
      imgURL: "/assets/icons/home.svg",
      route: "/",
      label: "Home",
    },
    {
      imgURL: "/assets/icons/searchHome.svg",
      route: "/all-users",
      label: "Search",
    },
    {
      imgURL: "/assets/icons/wallpaper.svg",
      route: "/explore",
      label: "Explore",
    },
    {
      imgURL: "/assets/icons/reels.svg",
      route: "/reels",
      label: "Reels",
    },
    {
      imgURL: "/assets/images/message.png",
      route: "/messages",
      label: "Messages",
    },
    {
      imgURL: "/assets/icons/bookmark.svg",
      route: "/saved",
      label: "Saved",
    },
    {
      imgURL: "/assets/icons/notification.svg",
      route: "/notification",
      label: "Notification",
    },
    {
      imgURL: "/assets/icons/gallery-add.svg",
      route: "/create-post",
      label: "Create Post",
    },
    {
      imgURL: user?.imageUrl || "/assets/icons/default-avatar.svg", // Handle undefined user
      route: `/profile/${user.id}`,
      label: "Profile",
    },
  ];
};

// Static bottom bar links
export const bottombarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create",
  },
];
