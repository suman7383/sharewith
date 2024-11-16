import UploadIcon from "./icons/uploadIcon";

interface props {
  isDragging: boolean;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleFileUpload: (file: File) => void;
}

export default function UploadComponent({
  isDragging,
  handleFileUpload,
  handleDragLeave,
  handleDragOver,
  handleDrop,
}: props) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label htmlFor="file-upload" className="cursor-pointer">
        <UploadIcon
          width="64"
          height="64"
          className="mx-auto w-12 h-12 text-gray-400 mb-2"
        />
        <span className="text-muted-foreground">
          {isDragging ? "Drop here" : "Drop files here or click to upload"}
        </span>
      </label>
      <input
        type="file"
        className="hidden"
        id="file-upload"
        onChange={(e) => handleFileUpload(e.target.files![0])}
        accept="*/*"
        multiple={false}
      />
    </div>
  );
}
