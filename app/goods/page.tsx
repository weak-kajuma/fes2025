'use client';

import styles from './page.module.css';
import { useScrollSmoother } from "@/components/ScrollSmoother";
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Goods = {
  id: number;
  name: string;
  price: number;
  image: string;
  state: number;
};

export default function GoodsPage() {
  useScrollSmoother();
  const [goods, setGoods] = useState<Goods[]>([]);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const res = await fetch('/data/goods.json');
        const data = await res.json();
        setGoods(Array.isArray(data) ? data : []);
      } catch {
        setGoods([]);
      }
    };
    fetchGoods();
  }, []);

  return (
    <div data-smooth-wrapper className={styles.wrapper}>
      <div className={styles.main} data-scroll-container>
        <div className={styles.top}>
          <div className={styles.title_area}>
            <h1 className={styles.title}>GOODS</h1>
            <p>グッズ一覧</p>
            <p>
              槻友会と高校文化祭実行委員会グッズ作成班の共同で制作した文化祭公式オリジナルグッズ。本年度 2 年目にして充実して帰ってきました。当日は無くなり次第、販売終了とさせていただきます。お求めの方はお早めにお越しください。
            </p>
            <p className={styles.saleplace}>
              販売場所：　J1-1
            </p>
          </div>
        </div>
        <div className={styles.products}>
          <div className={styles.products_container}>
            {goods.map(item => (
              <div key={item.id} className={styles.product_card}>
                <div className={styles.product_img_wrapper} style={{ position: 'relative' }}>
                  {item.state === 0 && (
                    <div className={styles.soldout_label}>
                      SOLD OUT
                    </div>
                  )}
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={500}
                    height={500}
                    style={{ objectFit: 'cover', borderRadius: '1rem', width: '100%', height: '100%' }}
                  />
                </div>
                <div className={styles.product_info}>
                  <h2 className={styles.product_name}>{item.name}</h2>
                  <div className={styles.product_price}>¥{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}