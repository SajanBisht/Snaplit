import { useCallback, useState, useRef } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Button } from '../ui/button';

type FileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string;
    action: 'post' | 'reel'; // 'post' for image, 'reel' for video
};

function FileUploader({ fieldChange, mediaUrl, action }: FileUploaderProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            if (acceptedFiles.length > 0) {
                fieldChange(acceptedFiles);
                setFileUrl(URL.createObjectURL(acceptedFiles[0]));
            }
        },
        [fieldChange]
    );

    // Set accepted file types based on action
    const imageTypes = {
        'image/png': ['.png'],
        'image/jpg': ['.jpg'],
        'image/jpeg': ['.jpeg'],
        'image/svg+xml': ['.svg'],
    };

    const videoTypes = {
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/ogg': ['.ogg'],
    };

    const acceptedTypes = action === 'post' ? imageTypes : videoTypes;

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: acceptedTypes,
        multiple: false,
    });
    console.log(action)
    return (
        <div
            {...getRootProps()}
            className={`border-2 bg-gray-900 cursor-pointer mt-2 h-[38vh]  mx-2 flex rounded-xl justify-center items-center `}
        >
            <input {...getInputProps()} />
            {fileUrl || mediaUrl ? (
                <div
                    className="justify-center h-full w-full lg:p-8 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {action === 'post' ? (
                        <img
                            src={fileUrl ?? mediaUrl}
                            alt="Uploaded"
                            className="h-[88%] w-full rounded-xl object-cover"
                            onClick={(e) => e.stopPropagation()} // prevent outer click trigger
                        />
                    ) : (
                        <video
                            src={fileUrl ?? mediaUrl}
                            controls
                            className="h-[100%] w-full rounded-xl object-cover"
                            onClick={(e) => e.stopPropagation()} // same for video
                        />
                    )}
                    <p className="text-gray-400 justify-center flex mt-2">
                        Click or drag {action === 'post' ? 'photo' : 'video'} to replace
                    </p>
                </div>

            ) : (
                <div className="place-items-center text-center pt-3">
                    <img src={action === "post" ? "/assets/icons/file-upload.svg" : "/assets/icons/reels.svg"} alt="file-upload" width={96} height={77} />
                    <h3 className="bold">Drag {action === 'post' ? 'photo' : 'video'} here</h3>
                    <p className="text-gray-400 text-[14px]">
                        {action === 'post' ? 'SVG, PNG, JPG' : 'MP4, WEBM, OGG'}
                    </p>
                    <Button className="bg-gray-800 mt-1">Select from computer</Button>
                </div>
            )}
        </div>
    );
}

export default FileUploader;
