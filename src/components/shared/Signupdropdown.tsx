import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form"; // <-- added for better form typing

interface SignupValidation {
    email: string;
    name: string;
    password: string;
    username: string;
}

interface SignupDropdownProps {
    submitted: boolean;
    setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    usernameSuggestions: string[];
    setUsernameSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
    form: UseFormReturn<SignupValidation>; // Replace `any` with your form schema if you have one
}

const SignupDropdown = ({
    submitted,
    setSubmitted,
    usernameSuggestions,
    setUsernameSuggestions,
    form,
}: SignupDropdownProps) => {
    const [open, setOpen] = useState(false);

    // Auto-open the dropdown when submitted becomes true and suggestions exist
    useEffect(() => {
        if (submitted && usernameSuggestions.length > 0) {
            setOpen(true);
        }
    }, [submitted, usernameSuggestions]);

    return (
        <div>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all w-28">
                        Suggestions
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-950 w-52 rounded-2xl">
                    <DropdownMenuLabel className="text-white text-[18px]">
                        Suggested Usernames
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {usernameSuggestions.map((username, index) => (
                        <DropdownMenuItem
                            key={index}
                            className="text-blue-600 cursor-pointer hover:underline px-2 py-1 rounded-md hover:bg-purple-700 transition-all hover:text-white"
                            onClick={() => {
                                form.setValue("username", username);
                                setUsernameSuggestions([]);
                                setOpen(false);
                                setSubmitted(false); // Optional: reset submission flag
                            }}
                        >
                            {username}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SignupDropdown;
