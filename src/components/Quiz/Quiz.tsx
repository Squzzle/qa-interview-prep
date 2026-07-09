import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {loadQuizBank} from './bank';
import {selectRandom} from './select';
import {isCorrect} from './grading';
import type {QuizQuestion} from './types';
import styles from './Quiz.module.css';

const TEST_SIZE = 20;

export default function Quiz(): React.ReactElement {
  const bank = useMemo(() => loadQuizBank(), []);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo<QuizQuestion[]>(
    () => (started ? selectRandom(bank, TEST_SIZE) : []),
    [started, round, bank],
  );

  function toggle(qid: string, idx: number) {
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      return {...prev, [qid]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]};
    });
  }

  function start() {
    setAnswers({}); setSubmitted(false); setStarted(true); setRound((r) => r + 1);
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
    return (
      <div>
        <h2>Результат: {score} / {questions.length}</h2>
        {wrong.length === 0 ? (
          <p>Все ответы верны! 🎉</p>
        ) : (
          <>
            <p>Разберите темы, где были ошибки:</p>
            <ul>
              {wrong.map((q) => (
                <li key={q.id}>
                  {q.question} — <Link to={q.topicUrl}>Разобрать тему</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <button className="button button--primary" onClick={start}>Пройти заново</button>
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
