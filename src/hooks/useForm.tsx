import { useState } from 'react';

type FormState = Record<string, string>;

const useForm = () => {
    const [form, setForm] = useState<FormState>({});

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [id]: value }));
    };

    return { onChange, form, setForm };
};

export default useForm;