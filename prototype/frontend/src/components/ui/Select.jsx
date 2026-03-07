import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ value, onChange, options, placeholder = "Select" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center px-2 py-[5px] justify-between gap-2 bg-zinc-800 hover:text-white rounded-md  text-xs text-white/90 focus:outline-none focus:border-zinc-700 transition-all w-[100px]"
            >
                <span>{value || placeholder}</span>
                <ChevronDown size={15} className={` transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Content */}
            <div className={`z-[500] absolute top-full right-0 mt-1 w-[100px] bg-[#0A0A0A] border border-zinc-800 rounded-md shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-1 flex flex-col gap-0.5">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors hover:text-white ${value === option ? 'bg-zinc-800 text-white/90' : 'text-zinc-400 hover:bg-zinc-900 '}`}
                        >
                            <span>{option}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Select;
