'use client'

import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function RiddleAnswerPage() {
  const params = useParams();
  const router = useRouter();
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
      // localStorageに正解したidを保存
      try {
        const correctList = JSON.parse(localStorage.getItem('correctAnswers') || '[]');
        if (!correctList.includes(id)) {
          correctList.push(id);
          localStorage.setItem('correctAnswers', JSON.stringify(correctList));
        }
      } catch (e) {
        // localStorageが使えない場合は何もしない
      }
      // 正解ならriddleページに遷移
      router.push('/riddle');
    } else {
      setResult("不正解");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.backDesign}>
        <Image src="/riddle/design_1.svg" width={1000} height={1000} alt="謎解きデザイン" className={styles.svg} />
        <div className={styles.back}></div>
        <div className={styles.line_top}></div>
        <div className={styles.line_bottom}></div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>No.{id}</h1>
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
