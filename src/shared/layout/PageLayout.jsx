import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './PageLayout.module.css';

export default function PageLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />

      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
