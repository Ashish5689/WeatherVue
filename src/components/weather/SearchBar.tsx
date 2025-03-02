import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchHistoryItem {
  id: string;
  location: string;
}

interface SearchBarProps {
  onSearch?: (location: string) => void;
  searchHistory?: SearchHistoryItem[];
  isLoading?: boolean;
}

const SearchBar = ({
  onSearch = () => {},
  searchHistory = [
    { id: "1", location: "New York" },
    { id: "2", location: "London" },
    { id: "3", location: "Tokyo" },
  ],
  isLoading = false,
}: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleHistoryItemClick = (location: string) => {
    setSearchInput(location);
    onSearch(location);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/20 backdrop-blur-sm border-white/30 focus:border-blue-400 text-slate-800 placeholder:text-slate-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {searchHistory.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-slate-500 self-center">
              Recent searches:
            </span>
            {searchHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleHistoryItemClick(item.location)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors",
                  "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
                  "border border-white/30 text-slate-700",
                  searchInput === item.location &&
                    "bg-blue-100 border-blue-300",
                )}
              >
                {item.location}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
