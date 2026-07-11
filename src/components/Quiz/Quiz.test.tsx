// @vitest-environment jsdom
import React from 'react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';

// @docusaurus/Link is aliased to a test stub in vitest.config.ts.
// The bank loader uses webpack require.context; replace it with a fixed bank.
vi.mock('./bank', () => ({
  loadQuizBank: () => [
    {
      id: 'q-single',
      category: 'Demo',
      question: 'Столица Франции?',
      options: ['Париж', 'Лондон', 'Берлин', 'Рим', 'Мадрид'],
      correct: [0],
      topicUrl: '/docs/intro',
    },
    {
      id: 'q-multi',
      category: 'Demo',
      question: 'Какие числа чётные?',
      options: ['1', '2', '3', '4', '5'],
      correct: [1, 3], // options "2" and "4"
      topicUrl: '/docs/multi',
    },
  ],
}));

import Quiz from './Quiz';

afterEach(cleanup);

const rowText = (el: HTMLElement | null) => el?.closest('div')?.textContent ?? '';

describe('Quiz results breakdown', () => {
  it('shows selected-vs-correct markers for every question after submit', () => {
    render(<Quiz />);
    fireEvent.click(screen.getByRole('button', {name: 'Пройти тест'}));

    // q-single: correct (Париж). q-multi: wrong — pick "2" (correct) and "1" (wrong), miss "4".
    fireEvent.click(screen.getByLabelText('Париж'));
    fireEvent.click(screen.getByLabelText('2'));
    fireEvent.click(screen.getByLabelText('1'));
    fireEvent.click(screen.getByRole('button', {name: 'Проверить'}));

    // Score + summary
    expect(screen.getByText('Результат: 1 / 2')).toBeTruthy();
    expect(screen.getByText(/Верно: 1 · Ошибок: 1/)).toBeTruthy();

    // All questions shown (not only wrong): both badges present
    expect(screen.getByText('✔ Верно')).toBeTruthy();
    expect(screen.getByText('✘ Ошибка')).toBeTruthy();

    // Two chosen-correct options (Париж, "2")
    const chosenCorrect = screen.getAllByText(/ваш выбор, правильно/);
    expect(chosenCorrect).toHaveLength(2);
    const chosenCorrectRows = chosenCorrect.map((n) => rowText(n));
    expect(chosenCorrectRows.some((t) => t.includes('Париж'))).toBe(true);
    expect(chosenCorrectRows.some((t) => t.includes('2'))).toBe(true);

    // Missed-correct option is "4"
    expect(rowText(screen.getByText(/правильный ответ \(пропущен\)/))).toContain('4');

    // Wrong-selected option is "1"
    expect(rowText(screen.getByText(/ваш выбор, неверно/))).toContain('1');

    // Only the wrong question exposes a topic link, pointing at its topicUrl
    const topicLinks = screen.getAllByRole('link', {name: /Разобрать тему/});
    expect(topicLinks).toHaveLength(1);
    expect(topicLinks[0].getAttribute('href')).toBe('/docs/multi');
  });
});
