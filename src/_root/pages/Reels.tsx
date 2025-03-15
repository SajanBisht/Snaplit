
// import Loader from "@/components/shared/Loader";
// import ReelCard from "@/components/shared/ReelCard/ReelCard";
// import { useGetPaginatedReels } from "@/lib/react-query/queryAndMutations";
// import { IReel } from "@/types";
// import { useState, useEffect, useRef, useCallback } from "react";
// import InfiniteScroll from "react-infinite-scroll-component";

// const Reels = () => {
//   const {
//     data,
//     isPending,
//     fetchNextPage,
//     hasNextPage,
//   } = useGetPaginatedReels();

//   const [isMuted, setIsMuted] = useState(true);
//   const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

//   const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const allReels: IReel[] = data?.pages.flatMap((page) => page.data as unknown as IReel[]) ?? [];

//   const setWrapperRef = useCallback((id: string, node: HTMLDivElement | null) => {
//     wrapperRefs.current[id] = node;
//   }, []);

//   const [showPause, setShowPause] = useState(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         let visibleEntry: IntersectionObserverEntry | null = null;

//         for (const entry of entries) {
//           if (entry.intersectionRatio >= 0.6) {
//             visibleEntry = entry;
//             break;
//           }
//         }

//         if (visibleEntry) {
//           const id = visibleEntry.target.getAttribute("data-id");
//           if (id) {
//             setCurrentPlayingId(id);
//           }
//         }
//       },
//       {
//         threshold: [0.8], // trigger when 60% or more visible
//       }
//     );

//     Object.entries(wrapperRefs.current).forEach(([id, el]) => {
//       if (el) {
//         el.setAttribute("data-id", id);
//         observer.observe(el);
//       }
//     });

//     return () => {
//       observer.disconnect();
//     };
//   }, [allReels]);

//   const toggleMute = () => setIsMuted(prev => !prev);

//   return (
//     <div className=" w-full ">
//       {isPending && !data ? (
//         <div className="flex mt-[10%] ml-[50%] w-full">
//           <Loader />
//         </div>
//       ) : (
//         <InfiniteScroll
//           dataLength={allReels.length}
//           next={fetchNextPage}
//           hasMore={!!hasNextPage}
//           loader={<div className="flex justify-center"><Loader /></div>}
//           className="snap-y snap-mandatory scroll-smooth md:ml-[40%]"
//         >
//           <ul className="flex flex-col gap-0">
//             {allReels.map((reel: IReel) => (
//               <li key={reel.$id} className="w-full snap-start h-screen ">
//                 <ReelCard
//                   reel={reel}
//                   isMuted={isMuted}
//                   toggleMute={toggleMute}
//                   toggleComment={() => console.log("open comment modal")}
//                   currentPlayingId={currentPlayingId}
//                   setWrapperRef={(el) => setWrapperRef(reel.$id || '', el)}
//                   showPause={showPause}
//                   setShowPause={setShowPause }
//                 />
//               </li>
//             ))}
//           </ul>
//         </InfiniteScroll>
//       )}
//     </div>
//   );
// };

// export default Reels


import Loader from "@/components/shared/Loader";
import ReelCard from "@/components/shared/ReelCard/ReelCard";
import { useGetPaginatedReels } from "@/lib/react-query/queryAndMutations";
import { IReel } from "@/types";
import { useState, useEffect, useRef, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const Reels = () => {
  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
  } = useGetPaginatedReels();

  const [isMuted, setIsMuted] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allReels: IReel[] = data?.pages.flatMap((page) => page.data as unknown as IReel[]) ?? [];

  const setWrapperRef = useCallback((id: string, node: HTMLDivElement | null) => {
    wrapperRefs.current[id] = node;
  }, []);

  const [showPause, setShowPause] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let visibleEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.6) {
            visibleEntry = entry;
            break;
          }
        }

        if (visibleEntry) {
          const id = visibleEntry.target.getAttribute("data-id");
          if (id) {
            setCurrentPlayingId(id);
          }
        }
      },
      {
        threshold: [0.8], // trigger when 60% or more visible
      }
    );

    Object.entries(wrapperRefs.current).forEach(([id, el]) => {
      if (el) {
        el.setAttribute("data-id", id);
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [allReels]);

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <div className=" w-full ">
      {isPending && !data ? (
        <div className="flex mt-[10%] ml-[50%] w-full">
          <Loader />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={allReels.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<div className="flex justify-center"><Loader /></div>}
          className="snap-y snap-mandatory scroll-smooth md:ml-[40%]"
        >
          <ul className="flex flex-col gap-0">
            {allReels.map((reel: IReel) => (
              <li key={reel.$id} className="w-full snap-start h-screen ">
                <ReelCard
                  reel={reel}
                  isMuted={isMuted}
                  toggleMute={toggleMute}
                  toggleComment={() => console.log("open comment modal")}
                  currentPlayingId={currentPlayingId}
                  setWrapperRef={(el) => setWrapperRef(reel.$id || '', el)}
                  showPause={showPause}
                  setShowPause={setShowPause }
                />
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Reels