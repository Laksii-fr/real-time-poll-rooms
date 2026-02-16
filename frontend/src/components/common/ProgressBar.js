import styles from './ProgressBar.module.css';

export default function ProgressBar({ percentage, label, sublabel, color = 'var(--primary)' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.percentage}>{Math.round(percentage)}%</span>
      </div>
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
    </div>
  );
}
