export default (data, feedsElement, i18nextInstance) => {
	feedsElement.innerHTML = '';
	const card = document.createElement('div');
	card.classList.add('card', 'border-0');

	const cardBody = document.createElement('div');
	cardBody.classList.add('card-body');

	const cardTitle = document.createElement('h2');
	cardTitle.classList.add('card-title', 'h4');
	cardTitle.textContent = i18nextInstance.t('feedsTitle');

	cardBody.append(cardTitle);
	card.append(cardBody);

	data.forEach((feed) => {
		const list = document.createElement('ul');
		list.classList.add('list-group', 'border-0', 'rounded-0');

		const listItem = document.createElement('li');
		listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

		const feedTittle = document.createElement('h3');
		feedTittle.classList.add('h6', 'm-0');
		feedTittle.textContent = feed.title;

		const feedDescription = document.createElement('p');
		feedDescription.classList.add('m-0', 'small', 'text-black-50');
		feedDescription.textContent = feed.description;

		listItem.append(feedDescription);
		listItem.append(feedTittle);
		list.prepend(listItem);
		card.append(list);
		feedsElement.append(card);
	});
};
