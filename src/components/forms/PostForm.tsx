import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queryAndMutations"
import Loader from "../shared/Loader"

type PostFormProps = {
  post?: Models.Document;
  action: 'Create' | 'Update';
}

export function PostForm({ post, action }: PostFormProps) {
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  // 1. Define your form.
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.loaction : "",
      tags: post ? post.tags.join(',') : ''
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    console.log(values)

    try {
      if (post && action === 'Update') {
        try {
          await updatePost({
            ...values,
            postId: post.$id,
            imageId: post.imageId,
            imageUrl: post.imageUrl,

          })
          navigate('/')
        } catch (error) {
          toast({
            title: 'Please try again'
          })
        }
        return
      }
      await createPost({
        ...values,
        userId: user.id,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Please try again',
      });
    }
  }

  const handleCancel = () => {
    navigate('/')
    form.reset()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full min-h-screen ">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label text-xl ml-4 ">Caption</FormLabel>
              <FormControl>
                <Textarea placeholder="Write here . . ." {...field} className="xl:w-[70%] lg:w-[80%] md:w-[90%] w-[95%] mx-2 h-[20vh] mt-2" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label text-xl ml-4  ">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label text-xl ml-4">Add Location</FormLabel>
              <FormControl>
                <Input type='text' className="xl:w-[70%] lg:w-[80%] md:w-[90%] w-[95%] mx-2  mt-2" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label text-xl ml-4">Add Tags <span className="text-[16px] text-gray-400 ml-2 ">(Seperated by comma " ,")</span></FormLabel>
              <FormControl>
                <Input type='text' className="xl:w-[70%] lg:w-[80%] md:w-[90%] w-[95%] mx-2 mt-2 " placeholder="Art, Expression, Learn" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 item-center justify-end mr-[5%] md:mr-[9%] lg:mr-[19%] xl:mr-[29.6%] mb-6">
          <Button type="button" className="bg-purple-900 md:w-[10vw] lg:w-[7vw] w-[88px] cursor-pointer" onClick={handleCancel}>Cancel</Button>
          {isLoadingCreate ||isLoadingUpdate ? <div className="md:w-[10vw] lg:w-[7vw] w-[88px] cursor-pointer flex justify-center items-center"><Loader /></div> : <Button type="submit" className="bg-purple-900  md:w-[10vw] lg:w-[7vw] w-[88px] cursor-pointer p-2">{action} Post</Button>}
        </div>
      </form>
    </Form>
  )
}

export default PostForm
