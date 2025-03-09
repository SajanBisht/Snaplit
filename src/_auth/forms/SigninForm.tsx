import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import {  useSignInAccount } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";

const SigninValidation = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});


export default function SigninForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
    const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

    const form = useForm<z.infer<typeof SigninValidation>>({
        resolver: zodResolver(SigninValidation),
        defaultValues: { 
            email: "", 
            password: "" 
        },
    });
    

    const onSubmit = async (values: z.infer<typeof SigninValidation>) => {
        try {
            const session = await signInAccount({
                email: values.email,
                password: values.password,
            });

            console.log("Session Response:", session); // Debugging log

            if (!session) {
                return toast({ title: "Sign in failed. Please try again" });
            }

            const isLoggedIn = await checkAuthUser();
            console.log("Is User Logged In:", isLoggedIn); // Debugging log

            if (isLoggedIn) {
                form.reset();
                navigate("/");
            } else {
                return toast({ title: "Sign in failed. Please try again." });
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({ title: error.message });
            } else {
                toast({ title: "An unknown error occurred." });
            }
        }
    };


    return (
        <Form {...form}>
            <div className="my-3 text-center flex flex-col items-center">
            <img src="/assets/images/logoSnaplit2.png" alt="logo" className='w-full h-18 rounded-2xl ' />
                <h2 className="font-bold text-2xl">Log in to your account </h2>
                <p className="text-gray-600 mt-2">Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 flex flex-col gap-5 w-full max-w-md mt-2">
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
                <Button type="submit" className="shad-button_primary cursor-pointer" disabled={isUserLoading || isSigningIn}>
                    {isSigningIn ? ( 
                        <div className="flex justify-center items-center text-xl gap-2">
                            <Loader /> Loading...
                        </div>
                    ) : ("Sign-in")}
                </Button>

                <p className="text-small-regular text-light-2 text-center mt-2">
                    Don't have an account?
                    <Link to="/sign-up" className="text-blue-800 text-sm font-semibold ml-1">Sign up</Link>
                </p>
            </form>
        </Form>
    );
}
