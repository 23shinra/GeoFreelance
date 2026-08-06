import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchFieldProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    className?: string;
};

export function SearchField({
    value,
    onChange,
    onSubmit,
    placeholder = 'Поиск',
    className,
}: SearchFieldProps) {
    return (
        <label
            className={cn(
                'hairline flex items-center gap-3 rounded-full px-5',
                className,
            )}
        >
            <Search
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.25}
            />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        onSubmit();
                    }
                }}
                placeholder={placeholder}
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
        </label>
    );
}

type SelectFieldProps = {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
};

export function SelectField({
    value,
    onChange,
    options,
    className,
}: SelectFieldProps) {
    return (
        <div className="hairline relative flex items-center rounded-full">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={cn(
                    'w-full appearance-none rounded-full bg-transparent py-3 pr-10 pl-5 text-sm outline-none lg:w-48',
                    className,
                )}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-popover text-popover-foreground"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute right-4 size-4 text-muted-foreground"
                strokeWidth={1.25}
            />
        </div>
    );
}
