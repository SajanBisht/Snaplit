"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUserContext } from "@/context/AuthContext"

// 1. Zod schema
const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    bio: z.string(),
    gender: z.string(),
    address: z.string(),
})


// 2. Type from schema
type EditProfileFormValues = z.infer<typeof formSchema>

// 3. Component
const EditProfileSetting = () => {
    const { user: currentUser } = useUserContext();
    // 4. UseForm hook
    const form = useForm<EditProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "", // prefill with current user's username if available
            name: '',
            bio: '',
            address: '',
        },
    })

    // 5. Submit handler
    const onSubmit = (values: EditProfileFormValues) => {
        console.log("Updated username:", values.username)
        // TODO: Call backend/API to update the username
    }

    return (
        <div className="w-full md:px-24 mb-14">
            <Form {...form} >
                <h1 className="text-xl mb-6">Edit Profile</h1>
                {/* profile pic */}
                <div className="bg-gray-900 rounded-xl  p-3 flex gap-2 items-center my-6">
                    <img src={currentUser.imageUrl} alt="profile pic" className="w-16 h-16 rounded-full" />
                    <div>
                        <h1>{currentUser.username}</h1>
                        <h1>{currentUser.name}</h1>
                    </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="new username" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public username.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bio" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public Bio.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Add Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="add address" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your Address (It will Not be at display).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-gray-700 text-white "
                                    >
                                        <option value="" disabled hidden>
                                            Select Gender
                                        </option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormControl>
                                <FormDescription>This is your public gender.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="bg-purple-600">Update Profile</Button>
                </form>
            </Form>
        </div>
    )
}

export default EditProfileSetting
