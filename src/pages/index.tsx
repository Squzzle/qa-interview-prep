import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): React.ReactElement {
  return (
    <Layout title="QA Interview Prep" description="Подготовка к QA-собеседованиям">
      <main style={{maxWidth: 760, margin: '0 auto', padding: '3rem 1rem'}}>
        <h1>Подготовка к собеседованиям по тестированию</h1>
        <p>Структурированные вопросы 2025–2026 с исчерпывающими ответами.</p>
        <p>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Открыть каталог вопросов
          </Link>{' '}
          <Link className="button button--secondary button--lg" to="pathname:///test">
            Пройти тест
          </Link>
        </p>
      </main>
    </Layout>
  );
}
