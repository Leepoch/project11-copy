import { string } from 'yup';
import onChange from 'on-change';

const render = (path, value) => {
    const input = document.querySelector('#url-input');
    const feedback = document.querySelector('.feedback');

    switch (value) {
        case 'finished':
            input.classList.remove('is-invalid');
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            feedback.textContent = 'RSS успешно загружен';
            input.value = '';
            input.focus();
            break;
        case 'notUrl':
            input.classList.add('is-invalid');
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            feedback.textContent = 'Ссылка должна быть валидным URL';
            break;
        case 'notOneOf':
            input.classList.add('is-invalid');
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            feedback.textContent = 'RSS уже существует';
            break;
        default:
            break;
    }
}

export default () => {
    const state = {
        feeds: [],
        form: {
            state: 'filling',
            error: '',
        }
    }

    const wathedState = onChange(state, render);
    
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let urlSchema = string().url('notUrl').notOneOf(onChange.target(wathedState).feeds, 'notOneOf');
        const formData = new FormData(e.target);
        const url = formData.get('url');

        urlSchema.validate(url)
            .then((validationResult) => {
                wathedState.feeds.push(validationResult);
                wathedState.form.state = 'finished';
            }).catch((e) => {
                wathedState.form.error = e.message;
            });
    });
}