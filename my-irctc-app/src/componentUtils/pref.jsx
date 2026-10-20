const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? JSON.parse(token) : null;
};

const setToken = (token) => {
  localStorage.setItem('token', JSON.stringify(token));
};

const removeToken = () => {
  localStorage.removeItem('token');
};

export { getToken, setToken, removeToken };