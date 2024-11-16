// import { useFileState } from "@/store/file";
import { Input } from "./ui/input";

export default function CreateSession({ name, value, onChange }: Props) {
  // const {setFile} = useFileState();

  return (
    <section className="flex flex-col gap-4">
      <Input
        placeholder="password/key"
        type="password"
        value={value}
        name={name}
        onChange={(e) => onChange(e.target.value)}
        className="border-dashed border-2 border-gray-300 focus-within:border-hidden"
      />
    </section>
  );
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  name: string;
}
