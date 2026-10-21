/**
 * Quiz — ten questions on structure, region and dating.
 *
 * Every answer is explained, because a quiz that only scores you teaches
 * less than one that shows why.
 */

import { el, clear } from '../core/dom.js';
import { t, pick } from '../core/i18n.js';
import { QUIZ } from '../data/quiz.js';
import { recordQuiz, setBestQuiz, getBestQuiz } from '../core/store.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function renderQuiz(host) {
  const shell = el('div.quiz-shell');
  let index = 0;
  let score = 0;
  let answered = false;
  const answers = new Array(QUIZ.length).fill(null);

  function progressBar() {
    const bar = el('div.quiz-progress', { 'aria-hidden': 'true' });
    for (let i = 0; i < QUIZ.length; i += 1) {
      bar.append(el('i', {
        class: i < index ? 'is-done' : (i === index ? 'is-current' : ''),
      }));
    }
    return bar;
  }

  function renderStart() {
    clear(shell);
    shell.append(el('div.band-inner', {}, [
      el('div.band-head', {}, [
        el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('quiz.eyebrow') })]),
        el('h2.band-title', {}, [
          el('span', { text: t('quiz.title') }),
          el('span.en', { text: t('quiz.titleEn') }),
        ]),
        el('p.band-lede', { text: t('quiz.lede') }),
      ]),
      el('div.quiz-score', {}, [
        el('div.num', { text: String(QUIZ.length) }),
        el('p', { text: t('quiz.scoreNote', { n: QUIZ.length }) }),
        getBestQuiz() ? el('p', { text: `${t('quiz.best')}：${getBestQuiz()} / ${QUIZ.length}` }) : null,
        el('div.quiz-actions', { style: { justifyContent: 'center' } }, [
          el('button.btn.btn-primary', {
            type: 'button', text: t('quiz.start'),
            on: {
              click: () => {
                index = 0; score = 0; answered = false;
                answers.fill(null);
                renderQuestion();
              },
            },
          }),
        ]),
      ]),
    ]));
  }

  function renderQuestion() {
    const q = QUIZ[index];
    clear(shell);

    const progress = progressBar();
    const options = el('div.quiz-options');
    const explain = el('div.quiz-explain', { hidden: '' });

    const optionNodes = q.options.map((opt, i) => {
      const node = el('button.quiz-opt', {
        type: 'button',
        on: {
          click: () => {
            if (answered) return;
            answered = true;
            const correct = i === q.answer;
            if (correct) score += 1;
            answers[index] = correct;
            recordQuiz(index, correct);
            node.classList.add(correct ? 'is-correct' : 'is-wrong');
            if (!correct) optionNodes[q.answer].classList.add('is-correct');
            for (const n of optionNodes) n.setAttribute('disabled', '');
            clear(explain);
            explain.removeAttribute('hidden');
            explain.append(el('b', { text: `${correct ? t('quiz.correct') : t('quiz.incorrect')} · ` }));
            explain.append(el('span', { text: t('quiz.answerOf', { a: pick(q.options[q.answer]) }) }));
            explain.append(el('div', { text: pick(q.explain), style: { marginTop: '.5rem' } }));
            nextBtn.removeAttribute('disabled');
            nextBtn.focus();
          },
        },
      }, [
        el('span.marker', { text: LETTERS[i] }),
        el('span', { text: pick(opt) }),
      ]);
      options.append(node);
      return node;
    });

    const nextBtn = el('button.btn.btn-primary', {
      type: 'button',
      text: index === QUIZ.length - 1 ? t('quiz.finish') : t('quiz.next'),
      disabled: true,
      on: {
        click: () => {
          if (index < QUIZ.length - 1) { index += 1; answered = false; renderQuestion(); }
          else renderResult();
        },
      },
    });

    shell.append(el('div.band-inner', {}, [
      el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('quiz.eyebrow') })]),
      progress,
      el('h2.quiz-q', { text: pick(q.q) }),
      el('p.quiz-hint', { text: t('quiz.questionOf', { i: index + 1, n: QUIZ.length }) }),
      options,
      explain,
      el('div.quiz-actions', {}, [
        nextBtn,
        el('button.btn', {
          type: 'button', text: t('quiz.backToStart'),
          on: { click: renderStart },
        }),
      ]),
    ]));
  }

  function renderResult() {
    setBestQuiz(score);
    clear(shell);
    const wrong = answers
      .map((ok, i) => (ok ? null : QUIZ[i]))
      .filter(Boolean);

    shell.append(el('div.band-inner', {}, [
      el('div.band-head', {}, [
        el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('quiz.eyebrow') })]),
        el('h2.band-title', {}, [
          el('span', { text: t('quiz.resultTitle') }),
          el('span.en', { text: t('quiz.titleEn') }),
        ]),
      ]),
      el('div.quiz-score', {}, [
        el('div.num', { text: `${score}` }),
        el('p', { text: t('quiz.resultNote', { c: score, n: QUIZ.length }) }),
        el('p', { text: `${t('quiz.best')}：${getBestQuiz()} / ${QUIZ.length}` }),
        el('div.quiz-actions', { style: { justifyContent: 'center' } }, [
          el('button.btn.btn-primary', {
            type: 'button', text: t('quiz.retry'),
            on: {
              click: () => {
                index = 0; score = 0; answered = false;
                answers.fill(null);
                renderQuestion();
              },
            },
          }),
          el('a.btn', { href: '#/catalog', text: t('case.back') }),
        ]),
      ]),
      wrong.length ? el('div.detail-body', {}, [
        el('h3', { text: t('quiz.explain') }),
        el('ul.step-list', {}, wrong.map((q) => el('li', { text: `${pick(q.q)} — ${pick(q.options[q.answer])}` }))),
      ]) : null,
    ]));
  }

  renderStart();
  host.append(shell);
}
