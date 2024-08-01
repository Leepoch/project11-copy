export default (url) => {
    console.log(url)
    const parser = new DOMParser();
    const data = parser.parseFromString(url, 'text/xml');
    const errorNode = data.querySelector('parsererror');
    if (errorNode) {
        return 'error';
    } else {
        return 'kek';
    }
}