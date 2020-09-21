const trim = input => {
  // Return if empty
  if (!input || !input.length) {
    return '';
  }

  let startChar = '';
  let endChar = '';
  let startPoint = 0;
  let endPoint = input.length;

  // Get starting character, it should be [ or {
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '[' || input[i] === '{') {
      startChar = input[i];
      endChar = startChar === '[' ? ']' : '}';
      startPoint = i;

      break;
    }
  }

  for (let i = input.length - 1; i > 0; i--) {
    if (input[i] === endChar) {
      endPoint = i;

      break;
    }
  }

  return input.substr(startPoint, endPoint - startPoint + 1);
};

export { trim };
