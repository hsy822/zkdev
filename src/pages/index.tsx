import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function HomepageHeader() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Layout title="zkdev" description="Privacy-first zk developer portal">
      <main className={styles.main}>
        <img className={styles.avatar} src="/img/profile.jpg" alt="avatar" />
        <h1 className={styles.name}>Sooyoung Hyun</h1>
        <p className={styles.desc}>
          Contributor & Home Staker at{' '}
          <a href="https://x.com/aztecnetwork" target="_blank" className={styles.link}>
            Aztec
          </a>
        </p>
        <p className={styles.desc}>
          <a href="https://x.com/EthereumRemix" target="_blank" className={styles.link}>
            Remix IDE
          </a>{' '}
          enthusiast
        </p>
        <p className={styles.desc} style={{ marginBottom: '20px' }}>
          Passionate about zero-knowledge and developer education
        </p>

        <div className={styles.buttons}>
          <a href="https://github.com/hsy822" className={styles.btn} target="_blank">
            <img src="/img/github-icon.svg" className={styles.icon} />
            GitHub
          </a>
          <a href="https://x.com/HyunSooyoung" className={styles.btn} target="_blank">
            <img src="/img/x-icon.svg" className={styles.icon} />
            X
          </a>
        </div>
      </main>
    </Layout>
  );
}
