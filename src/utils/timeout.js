import axios from 'axios';
import onChange from 'on-change';
import parser from './parserRSS';
import prepareData from './prepareData';

const timeout = (watchedState) => {
    setTimeout(() => {
        const { urls } = onChange.target(watchedState);
        const oldPosts = onChange.target(watchedState).data.postsData;
        urls.forEach((url) => {
            axios.get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${url}`)
                .then((response) => {
                    const doc = parser(response.data);
                    const { postsData } = prepareData(doc, urls.length);
                    oldPosts.forEach((oldPost) => {
                        const newPosts = postsData.filter((post) => post.title !== oldPost.title);
                        console.log(newPosts);
                    });
                });
        });

        timeout(watchedState);
    }, '5000');
}
export default timeout;