import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {loadQuizBank} from './bank';
import {selectRandom} from './select';
import {isCorrect} from './grading';
import {optionStatus, type OptionStatus} from './review';
import type {QuizQuestion} from './types';
import styles from './Quiz.module.css';

const TEST_SIZE = 20;

export default function Quiz(): React.ReactElement {
  const bank = useMemo(() => loadQuizBank(), []);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  // The drawn set is committed to state (not derived via useMemo) so it stays
  // stable across answer toggles and re-renders, changing only on start().
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  function toggle(qid: string, idx: number) {
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      return {...prev, [qid]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]};
    });
  }

  function start() {
    setQuestions(selectRandom(bank, TEST_SIZE));
    setAnswers({}); setSubmitted(false); setStarted(true);
  }

  if (!started) {
    return (
      <div className={styles.center}>
        <p>В базе {bank.length} вопросов. Тест — {Math.min(TEST_SIZE, bank.length)} случайных.</p>
        <button className="button button--primary button--lg" onClick={start}>Пройти тест</button>
      </div>
    );
  }

  if (submitted) {
    const wrong = questions.filter((q) => !isCorrect(answers[q.id] ?? [], q.correct));
    const score = questions.length - wrong.length;
    const optClass: Record<OptionStatus, string> = {
      'correct-selected': styles.correctSel,
      'correct-missed': styles.correctMiss,
      'wrong-selected': styles.wrongSel,
      neutral: styles.neutral,
    };
    const mark = (st: OptionStatus) =>
      st === 'wrong-selected' ? '✘' : st === 'neutral' ? '•' : '✔';
    const note = (st: OptionStatus) =>
      st === 'correct-selected'
        ? 'ваш выбор, правильно'
        : st === 'correct-missed'
          ? 'правильный ответ (пропущен)'
          : st === 'wrong-selected'
            ? 'ваш выбор, неверно'
            : '';
    return (
      <div>
        <h2>Результат: {score} / {questions.length}</h2>
        <p className={styles.summary}>Верно: {score} · Ошибок: {wrong.length}</p>
        {wrong.length === 0 && <p>Все ответы верны! 🎉</p>}
        {questions.map((q, qi) => {
          const sel = answers[q.id] ?? [];
          const ok = isCorrect(sel, q.correct);
          return (
            <fieldset key={q.id} className={`${styles.q} ${ok ? styles.qOk : styles.qBad}`}>
              <legend>
                <b>{qi + 1}.</b> {q.question}{' '}
                <span className={ok ? styles.badgeOk : styles.badgeBad}>
                  {ok ? '✔ Верно' : '✘ Ошибка'}
                </span>
              </legend>
              {q.options.map((opt, idx) => {
                const st = optionStatus(idx, q.correct, sel);
                const n = note(st);
                return (
                  <div key={idx} className={`${styles.review} ${optClass[st]}`}>
                    <span className={styles.mark}>{mark(st)}</span> {opt}
                    {n && <em className={styles.note}> — {n}</em>}
                  </div>
                );
              })}
              {!ok && (
                <div className={styles.topic}>
                  <Link to={q.topicUrl}>Разобрать тему →</Link>
                </div>
              )}
            </fieldset>
          );
        })}
        <button className="button button--primary button--lg" onClick={start}>Пройти заново</button>
      </div>
    );
  }

  return (
    <div>
      {questions.map((q, qi) => (
        <fieldset key={q.id} className={styles.q}>
          <legend><b>{qi + 1}.</b> {q.question}</legend>
          {q.options.map((opt, idx) => (
            <label key={idx} className={styles.opt}>
              <input
                type="checkbox"
                checked={(answers[q.id] ?? []).includes(idx)}
                onChange={() => toggle(q.id, idx)}
              />{' '}{opt}
            </label>
          ))}
        </fieldset>
      ))}
      <button className="button button--primary button--lg" onClick={() => setSubmitted(true)}>
        Проверить
      </button>
    </div>
  );
}
