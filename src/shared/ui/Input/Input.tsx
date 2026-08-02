import TextField from "@mui/material/TextField";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder,
  label,
  fullWidth = true,
}: InputProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      label={label}
      fullWidth={fullWidth}
      variant="outlined"
      size="small"
    />
  );
}
