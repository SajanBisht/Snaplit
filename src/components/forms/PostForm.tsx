import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { PostValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queryAndMutations";
import Loader from "../shared/Loader";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

export function PostForm({ post, action }: PostFormProps) {
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: [],
      location: post?.location || "",
      tags: post?.tags?.join(",") || ""
    }
  });

  const onSubmit = async (values: z.infer<typeof PostValidation>) => {
    try {
      if (post && '$id' in post && action === "Update") {
        await updatePost({
          ...values,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl
        });
        toast({ title: "Post updated successfully!" });
      } else {
        await createPost({ ...values, userId: user.id });
        toast({ title: "Post created successfully!" });
      }
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({ title: "Something went wrong, please try again." });
    }
  };

  const handleCancel = () => {
    form.reset();
    navigate("/");
  };

  const inputWidth = "w-[95%] md:w-[90%] lg:w-[80%] xl:w-[75%] mx-2";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`flex flex-col gap-9  min-h-screen mb-6 ${inputWidth}`}>
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
                  className={` h-[20vh] mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl ml-4">Add Photos</FormLabel>
              <FormControl >
                <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} action='post' />
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
                  placeholder="e.g. Jaipur, India"
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
                  placeholder="Art, Expression, Learn"
                  className={` mt-2 rounded-xl  text-white focus:ring-2 focus:ring-purple-600 transition-all`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-6 py-2 text-white border-purple-600 hover:bg-purple-900 transition-all"
            >
              Cancel
            </Button>
          </div>

          <div>
            {isCreating || isUpdating ? (
              <div className="w-[88px] flex justify-center items-center">
                <Loader />
              </div>
            ) : (
              <Button
                type="submit"
                className="rounded-full bg-purple-700 hover:bg-purple-800 px-6 py-2 text-white transition-all"
              >
                {action} Post
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

export default PostForm;
