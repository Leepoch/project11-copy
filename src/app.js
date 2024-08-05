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
import addProxy from './utils/addProxy';

const render = (elements, path, value, i18nextInstance, watchedState) => {
  const { input } = elements;
  const { feedback } = elements;
  const postsElement = document.querySelector('.posts');

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
    if (value === 'Network Error') {
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18nextInstance.t('networkError');
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
    createFeeds(watchedState, i18nextInstance);
    createPosts(watchedState, i18nextInstance);

    const postLinks = postsElement.querySelectorAll('a');
    const viewedPostsId = onChange.target(watchedState).uiState.viewedPostsId;
    postLinks.forEach((link) => {
      if (viewedPostsId.includes(link.dataset.id)) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
      }
    });
    postsElement.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-id')) {
        if (!viewedPostsId.includes(e.target.dataset.id)) {
          watchedState.uiState.activePostId = e.target.dataset.id;
          watchedState.uiState.viewedPostsId.push(e.target.dataset.id);
        }
      }
      if (e.target.tagName.toLowerCase() === 'button') {
        watchedState.uiState.activeModalId = e.target.dataset.id;
      }
    });
  }
  if (path === 'uiState.viewedPostsId') {
    const activePostId = onChange.target(watchedState).uiState.activePostId;
    const activeLink = postsElement.querySelector(`a[data-id="${activePostId}"]`)
    activeLink.classList.remove('fw-bold');
    activeLink.classList.add('fw-normal', 'link-secondary');
  }
  if (path === 'uiState.activeModalId') {
    const postsData = onChange.target(watchedState).data.postsData;
    const activePostId = onChange.target(watchedState).uiState.activePostId;
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer');
    const modalLink = modalFooter.querySelector('a');
    const [ activePostData ] = postsData.filter((post) => post.id === Number(activePostId));
    const { title, description, link } = activePostData;

    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLink.setAttribute('href', link);
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
    uiState: {
      activeModalId: 0,
      activePostId: 0,
      viewedPostsId: [],
    }
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
    const posts = onChange.target(watchedState).data.postsData;
    const urlSchema = string().url('notUrl').notOneOf(urls, 'notOneOf');
    const formData = new FormData(e.target);
    const url = formData.get('url');

    urlSchema.validate(url)
      .then((validationResult) => {
        axios.get(addProxy(url))
          .then((response) => {
            const doc = parser(response.data);
            watchedState.urls.push(validationResult);
            watchedState.form.state = 'finished';
            const { feedData, postsData } = prepareData(doc, urls.length, posts.length);
            watchedState.data.feedsData.push(feedData);
            watchedState.data.postsData.push(...postsData);
          }).catch((error) => {
            console.log(error.message)
            watchedState.form.error = error.message;
          });
      }).catch((error) => {
        watchedState.form.error = error.message;
      });
    timeout(watchedState);  
  });
};
