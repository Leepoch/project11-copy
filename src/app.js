import { string } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import ru from './locales/ru';
import parser from './utils/parserRSS';
import createFeeds from './utils/createFeeds';
import createPosts from './utils/createPosts';
import prepareData from './utils/prepareData';
import timeout from './utils/timeout';

const render = (elements, path, value, i18nextInstance, watchedState) => {
  const { input } = elements;
  const { feedback } = elements;

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
    if (value === 'parseError') {
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18nextInstance.t('parseError');
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
  if (path === 'data.postsData') {
    const feedsElement = document.querySelector('.feeds');
    const postsElement = document.querySelector('.posts');

    const feedsData = onChange.target(watchedState).data.feedsData;
    const postsData = onChange.target(watchedState).data.postsData;
    createFeeds(feedsData, feedsElement, i18nextInstance);
    createPosts(postsData, postsElement, i18nextInstance);

    const postsBtn = postsElement.querySelectorAll('button');
    postsBtn.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const modalFooter = document.querySelector('.modal-footer');
        const modalLink = modalFooter.querySelector('a');
        const activePostId = e.target.dataset.id;
        const activeLink = postsElement.querySelector(`a[data-id="${activePostId}"]`)
        const [ activePostData ] = postsData.filter((post) => post.id === activePostId);
        const { title, description, link } = activePostData;

        activeLink.classList.remove('fw-bold');
        activeLink.classList.add('fw-normal', 'link-secondary');
        modalTitle.textContent = title;
        modalBody.textContent = description;
        modalLink.setAttribute('href', link);
      });
    });
  }
};

export default () => {
  const state = {
    form: {
      state: 'filling',
      error: '',
    },
    urls: [],
    data: {
      feedsData: [],
      postsData: [],
    },
  };

  const elements = {
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });
  const watchedState = onChange(state, (path, value) => {
    render(elements, path, value, i18nextInstance, watchedState);
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { urls } = onChange.target(watchedState);
    const urlSchema = string().url('notUrl').notOneOf(urls, 'notOneOf');
    const formData = new FormData(e.target);
    const url = formData.get('url');

    urlSchema.validate(url)
      .then((validationResult) => {
        axios.get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${url}`)
          .then((response) => {
            const doc = parser(response.data);
            watchedState.urls.push(validationResult);
            watchedState.form.state = 'finished';
            const { feedData, postsData } = prepareData(doc, urls.length);
            watchedState.data.feedsData.push(feedData);
            watchedState.data.postsData.push(...postsData);
          }).catch((error) => {
            watchedState.form.error = error.message;
          });
      }).catch((error) => {
        watchedState.form.error = error.message;
      });
  });
  timeout(watchedState);
};
