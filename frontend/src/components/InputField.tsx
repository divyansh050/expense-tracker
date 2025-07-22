interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  max?: string;
  className?: string;
}

export const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  max,
  className = "w-full",
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="block text-gray-700 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        className="border px-2 py-2 rounded w-full h-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        min={type === "number" ? "0" : undefined}
        inputMode={type === "number" ? "decimal" : undefined}
      />
    </div>
  );
};
