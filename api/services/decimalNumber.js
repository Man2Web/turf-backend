const decimalNumber = (number) => {
  const convertedNumber = Number(number);
  return convertedNumber.toLocaleString();
};

module.exports = { decimalNumber };
