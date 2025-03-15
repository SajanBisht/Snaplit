

import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { isUsernameAvailable } from "@/lib/appwrite/api";
import SignupDropdown from "@/components/shared/Signupdropdown";

const SignupValidation = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    username: z.string().min(2, { message: "Username must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function SignupForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { checkAuthUser } = useUserContext();
    const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();
    const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();

    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: { name: "", username: "", email: "", password: "" },
    });

    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (values: z.infer<typeof SignupValidation>) => {
        try {
            // Check if the username is available
            const available = await isUsernameAvailable(values.username);
            if (!available) {
                toast({
                    title: "Username already taken. Here are some suggestions:",
                    variant: "destructive",
                });
                setSubmitted(true); // Trigger the suggestions fetching after submission
                return; // Prevent form submission if username is not available
            }

            // Create new user account
            const newUser = await createUserAccount(values);
            if (!newUser) throw new Error("Failed to create a new account.");

            // Sign in the new user
            const session = await signInAccount({ email: values.email, password: values.password });
            if (!session) throw new Error("Sign in failed. Please try again.");

            const isLoggedIn = await checkAuthUser();
            if (isLoggedIn) {
                form.reset();
                setUsernameSuggestions([]); // Clear suggestions on success
                navigate('/');
            } else {
                throw new Error("Sign up failed. Please try again.");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({ title: error.message });
            } else {
                toast({ title: "An unknown error occurred." });
            }
        }
    };

    // useEffect to fetch username suggestions only when form is submitted
    useEffect(() => {
        if (submitted) {
            async function fetchUsernameSuggestions() {
                try {
                    const response = await fetch('http://localhost:3001/api/suggest-usernames', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ fullName: "John Doe" }) // Pass fullName in the request body
                    });

                    const data = await response.json();
                    setUsernameSuggestions(data.suggestions); // Ensure this is the correct key
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            }

            fetchUsernameSuggestions();
        }
    }, [submitted]); // Dependency on `submitted` state

    return (
        <Form {...form}>
            <div className="my-3 text-center flex flex-col items-center">
                <img src="/assets/images/logoSnaplit2.png" alt="logo" className='w-full h-18 rounded-2xl ' />
                <h2 className="font-bold text-2xl">Create a new account</h2>
                <p className="text-gray-600 mt-2">To use Snapgram, enter your account details</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 flex flex-col gap-5 w-full max-w-md mt-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input type="text" className="shad-input" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input type="text" className="shad-input" {...field} />
                        </FormControl>
                        <FormMessage />

                        {Array.isArray(usernameSuggestions) && usernameSuggestions.length > 0 && (
                            <div className="mt-2 p-2 border border-gray-300 rounded-lg shadow-lg bg-gray-800">
                                <p className="text-sm text-gray-500 mb-2">Suggestions:</p>

                                {/* Render the dropdown with the correct props */}
                                <SignupDropdown
                                    submitted={submitted}
                                    setSubmitted={setSubmitted}
                                    usernameSuggestions={usernameSuggestions}
                                    setUsernameSuggestions={setUsernameSuggestions}
                                    form={form}
                                />
                            </div>
                        )}
                    </FormItem>
                )}
                />

                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" className="shad-input" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" className="shad-input" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="shad-button_primary" disabled={isCreatingUser || isSigningIn}>
                    {isCreatingUser ? (
                        <div className="flex justify-center items-center text-xl gap-2">
                            <Loader /> Loading...
                        </div>
                    ) : ("Sign-up")}
                </Button>
                <p className="text-small-regular text-light-2 text-center mt-2">
                    Already have an account?
                    <Link to="/sign-in" className="text-blue-800 text-sm font-semibold ml-1">Log in</Link>
                </p>
            </form>
        </Form>
    );
}
