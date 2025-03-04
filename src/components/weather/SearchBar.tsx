import React, { useState, useEffect } from "react";
import { Search, MapPin, History, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const popularCities = [
    "London", "New York", "Tokyo", "Paris", "Sydney", 
    "Dubai", "Singapore", "Rome", "Berlin", "Toronto"
  ];

  useEffect(() => {
    // Filter suggestions based on input
    if (searchInput.trim().length > 0) {
      const filtered = popularCities.filter(city => 
        city.toLowerCase().includes(searchInput.toLowerCase()) && 
        city.toLowerCase() !== searchInput.toLowerCase()
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setSuggestions([]);
    }
  };

  const handleHistoryItemClick = (location: string) => {
    setSearchInput(location);
    onSearch(location);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
  };
  
  const clearSearch = () => {
    setSearchInput("");
    setSuggestions([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-5"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search any city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="pl-12 pr-10 py-6 w-full bg-white/40 backdrop-blur-sm border-white/40 focus:border-blue-400 text-slate-800 placeholder:text-slate-500 text-lg rounded-xl shadow-inner"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 bg-white/50 p-1.5 rounded-full">
                <MapPin className="h-5 w-5" />
              </div>
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white/50 p-1.5 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-6 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </div>
              )}
            </Button>
          </div>
          
          {/* Suggestions dropdown */}
          <AnimatePresence>
            {isFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg rounded-xl overflow-hidden z-10"
              >
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={suggestion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 text-blue-500" />
                        {suggestion}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {searchHistory.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center text-sm text-slate-500 self-center mr-1">
              <History className="h-4 w-4 mr-1" />
              <span>Recent:</span>
            </div>
            {searchHistory.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHistoryItemClick(item.location)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-all",
                  "bg-white/40 hover:bg-white/60 backdrop-blur-sm",
                  "border border-white/40 text-slate-700 hover:shadow-md",
                  searchInput === item.location &&
                    "bg-blue-100/70 border-blue-300 text-blue-700",
                )}
              >
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default SearchBar;
