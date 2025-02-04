import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
}: SearchFilterProps) {
  return (
    <div className="p-2 bg-white rounded shadow flex items-center">
      <Search size={20} className="text-gray-400 mr-2" />
      <Input
        type="text"
        placeholder="Search nodes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
    </div>
  );
}
