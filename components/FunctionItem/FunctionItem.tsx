
import React from 'react';
import styles from './FunctionItem.module.css';
import { forwardRef } from 'react';
import Link from 'next/link';
import LiquidGlass from '../LiquidGlass/LiquidGlass';

type FunctionItemProps = {
  title?: string;
  icon?: string;
  href?: string;
  className?: string;
  scroll?: boolean;
}

const FunctionItem = forwardRef<HTMLDivElement, FunctionItemProps>(
  ({ title, icon, href = "", className = ""}, ref) => (
    <div className={`${styles.functionItem} ${className}`} ref={ref}>
      <LiquidGlass>
        <Link href={href} className={styles.inner} scroll={false}>
          <div className={styles.icon}>
            {icon && (
              <img src={icon} alt={title} className={styles.icon_svg} />
            )}
          </div>
          <div className={styles.title}>{title}</div>
        </Link>
      </LiquidGlass>
    </div>
  )
);
FunctionItem.displayName = 'FunctionItem';
export default FunctionItem;