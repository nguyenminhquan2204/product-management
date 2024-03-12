module.exports = (objectPagination, query, countProducts) => {
    if(query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    // console.log(objectPagination.skip);

    // Dem so luong san pham co trong database
    const totalPage = Math.ceil(countProducts/objectPagination.limitItems);
    objectPagination.totalPage = totalPage;

    return objectPagination;
}