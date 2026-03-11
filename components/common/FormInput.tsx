import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  form: Record<string, string>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: string;
  error?: string;
}

const FormInput = ({
  label,
  name,
  type = "text",
  placeholder,
  form,
  onChange,
  required = false,
  value,
  error,
}: FormInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value ?? form?.[name] ?? ""}
        onChange={onChange}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;