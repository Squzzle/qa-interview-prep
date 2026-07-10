import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

export default function TestPage(): React.ReactElement {
  return (
    <Layout title="Пройти тест" description="Проверка знаний QA">
      <main style={{maxWidth: 820, margin: '0 auto', padding: '2rem 1rem'}}>
        <h1>Проверка знаний</h1>
        <BrowserOnly>{() => {
          const Quiz = require('@site/src/components/Quiz/Quiz').default;
          return <Quiz />;
        }}</BrowserOnly>
      </main>
    </Layout>
  );
}
