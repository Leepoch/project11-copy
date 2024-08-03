import _ from 'lodash';

export default (doc, urlsLength) => {
  const feedData = {
    id: urlsLength,
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
    items: [],
  };

  const postsData = [];
  doc.querySelectorAll('item').forEach((itemDoc) => {
    const item = {
      id: _.uniqueId(),
      feedId: urlsLength,
      title: itemDoc.querySelector('title').textContent,
      description: itemDoc.querySelector('description').textContent,
      link: itemDoc.querySelector('link').textContent,
    };
    postsData.push(item);
  });
  return { feedData, postsData };
};
