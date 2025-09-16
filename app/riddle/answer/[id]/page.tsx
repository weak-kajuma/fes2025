'use client'

import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { useEffect, useState } from 'react';

export default function RiddleAnswerPage() {
  const params = useParams();
  const id = params.id;
  const [answerList, setAnswerList] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/riddle/muzunazo.json')
      .then(res => res.json())
      .then((data) => {
        const found = data.find((item: any) => String(item.id) === String(id));
        setAnswerList(found ? found.answer : []);
      });
  }, [id]);

  const handleCheck = () => {
    if (answerList.some(ans => ans === input.trim())) {
      setResult("正解！");
    } else {
      setResult("不正解");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>難謎 No.{id}</h1>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="答えを入力"
          className={styles.input}
        />
        <button
          onClick={handleCheck}
          className={styles.button}
        >判定</button>
        {result && <p className={styles.result}>{result}</p>}
      </div>
    </div>
  );
}
