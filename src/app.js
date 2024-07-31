import { string, url, object } from 'yup';

export default () => {

    let urlSchema = string().url();
    
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const formData = new FormData(e.target);
        const url = formData.get('url');

        urlSchema.validate(url)
        .then((validationResult) => {
            console.log(validationResult)
        })
    });
        // is-invalid
}