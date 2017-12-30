class QueryHelper {
  constructQueryParams(params) {
    let queryString = '';

    Object.keys(params).forEach((key, index) => {
      if (!params[key]) {
        queryString += '';
      }
      else if (index > 0) {
        queryString += `&${key}=${params[key]}`;
      } else {
        queryString += `?${key}=${params[key]}`;
      }
    });
    return queryString;

  }
}

module.exports = QueryHelper;
