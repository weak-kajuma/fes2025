"use client";

import { useRef, useEffect, useState } from "react";

import styles from './searchBar.module.css';

type AnimatedSearchBarProps = {
  value?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value = "", onSubmit, onChange, placeholder }: AnimatedSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // valueは親から受け取るのでローカルstateは不要
  // useEffectはinputのrequired属性を外す副作用のみ

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.removeAttribute("required");
      }
    }, 200);
    return () => { clearTimeout(timer); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value); // 親に通知
  };

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
        onInvalid={e => { e.preventDefault(); }}
        required
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <button className={styles.search_btn} type="submit">
        <span>Search</span>
      </button>
    </form>
  );
}