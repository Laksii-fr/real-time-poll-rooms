import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
