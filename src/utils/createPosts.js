export default (data, postsElement, i18nextInstance) => {
    postsElement.innerHTML = '';
    const card = `
    <div class="card border-0">
        <div class="card-body">
            <h2 class="card-title h4">${i18nextInstance.t('postsTitle')}</h2>
        </div>
        <ul class="list-group border-0 rounded-0"></ul>
    </div>
    `
    postsElement.innerHTML = card;
    data.forEach((feed) => {
        const list = postsElement.querySelector('ul');
        feed.items.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between');
            listItem.classList.add('align-items-start', 'border-0', 'border-end-0');
            listItem.innerHTML = `
                <a class="fw-bold" data-id="${item.id}" target="_blank" rel="noopener noreferrer"><a/>
                <button type="button" class="btn btn-outline-primary btn-sm" data-id="${item.id}"
                data-bs-toggle="modal">${i18nextInstance.t('viewBtn')}</button>
            `
            const link = listItem.querySelector('a');
            link.setAttribute('href', `${item.link}`);
            link.textContent = item.title;
            list.prepend(listItem);
        });
    });
}