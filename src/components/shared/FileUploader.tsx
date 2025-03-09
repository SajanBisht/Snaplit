import { useCallback, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Button } from '../ui/button';

type FileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string;
};

function FileUploader({ fieldChange, mediaUrl }: FileUploaderProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File[]>([]);

    console.log('mediaUrl', mediaUrl);
    console.log('fileUrl', file);
    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles);
            fieldChange(acceptedFiles);
            setFileUrl(URL.createObjectURL(acceptedFiles[0]));
        }
    }, [fieldChange]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpg': ['.jpg'],
            'image/jpeg': ['.jpeg'],
            'image/svg+xml': ['.svg'],
        },
    });
   
    return (
        <div
            {...getRootProps()}
            className="bg-gray-900 cursor-pointer mt-2 h-[36vh] xl:w-[70%] lg:w-[80%] md:w-[90%] w-[95%] mx-2 flex rounded-xl justify-center items-center"
        >
            <input {...getInputProps()} />
            {fileUrl || mediaUrl ? (
                <>
                    <div className=' justify-center h-full w-full p-5 lg:p-10 '>
                        <img src={fileUrl?fileUrl:mediaUrl} alt="Uploaded" className="h-[88%] w-full rounded-xl" />
                        <p className='text-gray-400 justify-center flex mt-2'>Click or drag photo to replace</p>
                    </div>
                </>
            ) : (
                    <div className="place-items-center text-center pt-3">
                        <img src="/assets/icons/file-upload.svg" alt="file-upload" width={96} height={77} />
                        <h3 className="bold">Drag photo here</h3>
                        <p className="text-gray-400 text-[14px]">SVG, PNG, JPG</p>
                        <Button className="bg-gray-800 mt-1">Select from computer</Button>
                    </div>
            )}
        </div>
    );
}

export default FileUploader;
