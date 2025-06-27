"use client";

import { useRef, useEffect, useState } from "react";
import styles from './searchBar.module.css';

type AnimatedSearchBarProps = {
  onSubmit?: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSubmit }: AnimatedSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.removeAttribute("required");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form className={styles.search_bar} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="search"
        name="search"
        pattern=".*\S.*"
        onInvalid={e => e.preventDefault()}
        required
        autoComplete="off"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button className={styles.search_btn} type="submit">
        <span>Search</span>
      </button>
    </form>
  );
}