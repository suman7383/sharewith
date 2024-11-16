import { getFileSize } from "@/lib/file";
import { Button } from "./ui/button";
import DustbinIcon from "./icons/dustbinIcon";
import { TFileDetails } from "@/hooks/useFileUpload";

interface props {
  file?: TFileDetails;
  clearFile: () => void;
}

export default function FileDetails({ file, clearFile }: props) {
  if (!file) return;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="mb-3">
        <p className="text-zinc-300">
          File name:&nbsp;
          <span className="text-muted-foreground">{file.name}</span>
        </p>
        <p className="text-card-foreground">
          Extension:&nbsp;
          <span className="text-muted-foreground">{file.extension}</span>
        </p>
        <p className="text-card-foreground">
          File size:{" "}
          <span
            className={`${
              file.totalSize > 5 * 1024 * 1024
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {getFileSize(file.totalSize)}
          </span>
        </p>
      </div>
      <div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            clearFile();
          }}
        >
          <DustbinIcon stroke="red" />
        </Button>
      </div>
    </div>
  );
}
