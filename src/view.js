import { string } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru';
import parser from './parserRSS'

const render = (elements, path, value, i18nextInstance) => {
    const input = elements.input;
    const feedback = elements.feedback;

    if (path === 'form.error') {
        if (value === 'notOneOf') {
            input.classList.add('is-invalid');
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            feedback.textContent = i18nextInstance.t('rssExist');
        }
        if (value === 'notUrl') {
            input.classList.add('is-invalid');
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            feedback.textContent = i18nextInstance.t('toBeValid');
        }
    }
    if (path === 'form.state') {
        if (value === 'finished') {
            input.classList.remove('is-invalid');
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            feedback.textContent = i18nextInstance.t('validationSuccess');
            input.value = '';
            input.focus();
        }
    }
};

export default () => {
  const state = {
    feeds: [],
    form: {
      state: 'filling',
      error: '',
    },
  };

  const elements = {
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  }

  const i18nextInstance = i18next.createInstance();
    i18nextInstance.init({
        lng: 'ru',
        debug: false,
        resources: {
            ru,
        },
    });
  const wathedState = onChange(state, (path, value) => {
    render(elements, path, value, i18nextInstance);
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlSchema = string().url('notUrl').notOneOf(onChange.target(wathedState).feeds, 'notOneOf');
    const formData = new FormData(e.target);
    const url = formData.get('url');
    console.log(parser(url));

    urlSchema.validate(url)
      .then((validationResult) => {
        wathedState.feeds.push(validationResult);
        wathedState.form.state = 'finished';
      }).catch((error) => {
        wathedState.form.error = error.message;
      });
  });
};
