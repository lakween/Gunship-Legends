import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Define props for the FormInput component
interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    form: Record<string, string>;
    onChange?: any;
    required?: boolean;
    value?: string;
}

const FormInput = ({
    label,
    name,
    type = 'text',
    placeholder,
    form,
    onChange,
    required = false,
    value,
}: FormInputProps) => {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value || form[name] || ""}
                onChange={onChange}
            />
        </div>
    );
};

export default FormInput;