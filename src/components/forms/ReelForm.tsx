import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { ReelValidation } from "@/lib/validation"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Models } from "appwrite"
import { useSaveReelsInDatabase } from "@/lib/react-query/queryAndMutations"
import { IReel } from "@/types"
import Loader from "../shared/Loader"

type ReelFormProps = {
  action: 'Create' | 'Update';
  reel?: Models.Document;
};

const ReelForm = ({ action, reel }: ReelFormProps) => {
  const { user: user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutate: saveReels, isPending: isLoading } = useSaveReelsInDatabase()

  const form = useForm<z.infer<typeof ReelValidation>>({
    resolver: zodResolver(ReelValidation),
    defaultValues: {
      caption: reel?.caption || "",
      file: [],
      location: reel?.location || "",
      tags: reel?.tags?.join(",") || "",
      audio: reel?.audio || "",
      duration: reel?.duration || 15,
    },
  });

  const handleCancel = () => {
    navigate('/');
    form.reset();
  };


  const onSubmit = async (values: z.infer<typeof ReelValidation>) => {
    try {
      if (!values.file || values.file.length === 0) {
        toast({ title: "Please upload a video." });
        return;
      }

      const videoFile = values.file[0];

      const reelData: IReel = {
        caption: values.caption,
        location: values.location,
        tags: (values.tags || '').split(',').map((tag) => tag.trim()),
        audio: values.audio,
        duration: values.duration,
        userId: user.id || '',
        file: [videoFile],
        thumbnailUrl: "https://placehold.co/600x400.png",
        likes: [],
        views: 0,
        comments: 0,
        videoId: "",
        videoUrl: "",
        createdAt: ""
      };

      saveReels(reelData, {
        onSuccess: () => {
          toast({ title: "Reel uploaded successfully!" });
          form.reset();
          navigate('/');
        },
        onError: () => {
          toast({ title: "Something went wrong while saving reel." });
        }
      });

    } catch (error) {
      toast({ title: "Failed to upload reel. Please try again." });
      console.error("Error saving reel:", error);
    }
  };



  const inputWidth = "w-[95%] md:w-[90%] lg:w-[80%] xl:w-[75%] mx-2";
  return (
    <div className={`dark:bg-zinc-900 rounded-xl shadow-lg ${inputWidth} mb-6`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
          {/* Caption */}
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">Caption</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write here..."
                    className={`h-[20vh] mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video */}
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">Upload Reel Video</FormLabel>
                <FormControl>
                  <FileUploader
                    fieldChange={field.onChange}
                    mediaUrl={reel?.videoUrl}
                    action={'reel'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Mumbai, India"
                    className={` mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">
                  Tags <span className="text-sm text-gray-400">(comma-separated)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="travel, food, fashion"
                    className={` mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Audio */}
          <FormField
            control={form.control}
            name="audio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">Audio Track</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Trending beat"
                    className={` mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl ml-4">Duration (15–60s)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={15}
                    max={60}
                    className={` mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4  ">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="rounded-full px-6 py-2 text-white border-purple-600 hover:bg-purple-900 transition-all"
            >
              Cancel
            </Button>
            {isLoading ?
              <div className="px-6 py-2"><Loader /></div> :
              <Button
                type="submit"
                className="rounded-full bg-purple-700 hover:bg-purple-800 px-6 py-2 text-white transition-all"
              >
                {action} Reel
              </Button>}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReelForm;


