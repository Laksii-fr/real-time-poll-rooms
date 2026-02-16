import styles from './Card.module.css';

export default function Card({ children, className = '', padding = 'md' }) {
  return (
    <div className={`${styles.card} ${styles[padding]} ${className}`}>
      {children}
    </div>
  );
}
