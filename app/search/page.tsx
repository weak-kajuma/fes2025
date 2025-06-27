"use client";

import { useState, useRef, useEffect } from "react";
import styles from './page.module.css';
import Tab from './components/tab';
import SearchBar from "./components/searchBar";

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.removeAttribute("required");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>SEARCH</h1>
      <SearchBar onSubmit={value => console.log(value)} />
      <section className={styles.selector}>
        <Tab title={"title"} children={
          "children"
          } />
        <Tab title={"title"} children={
          "children"
          } />
          <Tab title={"title"} children={
          "children"
          } />
        <Tab title={"title"} children={
          "children"
          } />
      </section>
    </div>
  );
}
