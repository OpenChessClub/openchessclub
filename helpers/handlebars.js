module.exports = {
  eq: (a, b) => String(a) === String(b),
  
  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString();
  },

  positiveChange: (change) => change > 0,

  abs: (num) => Math.abs(num),

  addOne: (val) => val + 1,

  json: (obj) => JSON.stringify(obj, null, 2)
};