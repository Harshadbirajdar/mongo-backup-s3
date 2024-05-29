exports.formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

exports.getDbName = (uri) => {
  let url = new URL(uri);
  return url.pathname.substring(1);
};
