
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useGetUsers } from "@/lib/react-query/queryAndMutations";
import { IReel } from "@/types";
import { useEffect, useRef, useState } from "react";

type ReelCardProps = {
    reel: IReel;
    toggleComment: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    currentPlayingId: string | null;
    setWrapperRef: (el: HTMLDivElement | null) => void;
    showPause: boolean;
    setShowPause: (arg0: boolean) => void;
};

const ReelCard = ({
    reel,
    toggleComment,
    isMuted,
    toggleMute,
    currentPlayingId,
    setWrapperRef,
    showPause,
    setShowPause
}: ReelCardProps) => {
    console.log(toggleComment)
    const { user } = useUserContext();
    console.log(user)
    const [shouldRender, setShouldRender] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);


    console.log("videoRef.current?.paused", videoRef.current?.paused)
    useEffect(() => {
        const timeout = setTimeout(() => setShouldRender(true), 300);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (currentPlayingId === reel.$id) {
            video.play().catch(() => { });
        } else {
            video.pause();
            video.currentTime = 0; // reset video to beginning
        }
    }, [currentPlayingId, reel.$id]);

    console.log("reel in reelcard", reel)
    const creatorOfReel = reel.userId;
    const { data: creatorInfo } = useGetUsers([creatorOfReel]);
    console.log("creator of reel info", creatorInfo);
    const creatorObj = creatorInfo?.[0];
    console.log("creator of reel info", creatorObj)


    return (
        <div
            ref={setWrapperRef}
            data-id={reel.$id}
            className="reel-card h-full  w-full   p-6"
        >
             <div className="h-full md:w-[48%] content-center relative overflow-clip shadow-2xl rounded-xl bg-black/80 backdrop-blur-sm">
                <div className="relative w-full aspect-video mb-4  rounded-md h-full overflow-clip">
                    {shouldRender ? (
                        <>
                            <video
                                ref={videoRef}
                                src={reel.videoUrl}
                                muted={isMuted}
                                autoPlay
                                loop
                                className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer overflow-clip"
                                onClick={() => {
                                    if (videoRef.current?.paused) {
                                        videoRef.current.play();
                                        setShowPause(!showPause);
                                    } else {
                                        videoRef.current?.pause();
                                        setShowPause(!showPause);
                                    }
                                }}
                            />
                            <button
                                onClick={toggleMute}
                                className="absolute my-4 right-4 bg-black/50 p-2 rounded-full"
                            >
                                <img
                                    src={isMuted ? "/assets/icons/mute.svg" : "/assets/icons/unmute.svg"}
                                    alt={isMuted ? "Unmute" : "Mute"}
                                    className="invert w-6 h-6"
                                />
                            </button>
                            {showPause && <div className="absolute right-[40%] top-[40%] rounded-full" onClick={() => {
                                if (videoRef.current?.paused) {
                                    videoRef.current.play();
                                    setShowPause(!showPause);
                                } else {
                                    videoRef.current?.pause();
                                    setShowPause(!showPause);
                                }
                            }}><img src="/assets/icons/play1.svg" alt="" className=" invert-50 w-18  p-2" /></div>}
                        </>
                    ) : (
                        <img
                            src={reel.thumbnailUrl || "/assets/icons/profile-placeholder.svg"}
                            alt="thumbnail"
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                    )}
                </div>
                {/* user Profile */}
                <div className="ml-4 bottom-4 absolute">
                    <div className="flex gap-3 items-center justify-start">
                        <div><img src={creatorObj?.imageUrl} alt="creator Image" className="w-10 h-10 rounded-full" /></div>
                        <div className=""> {/* Increased width to see the animation */}
                            <p>{creatorObj?.username}</p>
                            <div className="relative w-60 h-6 overflow-hidden bg-gray-800">
                                <p className="absolute whitespace-nowrap animate-marquee text-white">
                                    🎶 This is a working marquee animation in Tailwind!
                                </p>
                            </div>
                        </div>
                        <Button className="border-1 p-0 w-20  h-8">Follow</Button>
                    </div>
                    <div>
                        <p>{reel.caption}</p>
                        <p className="text-gray-700">Location:{reel.location}</p>
                        <p className="text-gray-400 text-[14px] w-[80%]">
                            {reel.tags?.map((tag, index) => (
                                <span key={index}>#{tag} </span>
                            ))}
                        </p>
                    </div>
                </div>
                <div className="absolute right-3 top-[45%] flex flex-col gap-2">
                    <div>
                        <Button>
                            <img src="/assets/icons/like2.svg" alt="like" className="w-7 invert drop-shadow-[0_0_1px_white]" />
                        </Button>
                    </div>
                    <div>
                        <Button>
                            <img src="/assets/icons/chat2.svg" alt="chat" className="w-7 invert drop-shadow-[0_0_1px_white]" />
                        </Button>
                    </div>
                    <div>
                        <Button>
                            <img src="/assets/icons/share2.svg" alt="share" className="w-7 invert drop-shadow-[0_0_1px_white]" />
                        </Button>
                    </div>
                    <div>
                        <Button>
                            <img src="/assets/icons/save2.svg" alt="save" className="w-7 invert drop-shadow-[0_0_1px_white]" />
                        </Button>
                    </div>
                    <div>
                        <Button>
                            <img
                                src="/assets/images/3dot-horizontal.png"
                                alt="3dot-horizontal"
                                className="invert w-5 ml-1"
                            />
                        </Button>
                    </div>
                </div>
                {/* Video / Content goes here */}
                ...
            </div>

        </div>
    );
};

export default ReelCard;
