export function maxSlidingWindow(arr, k) {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }

  if (k <= 0 || k > arr.length) {
    throw new RangeError('Invalid k');
  }

  const result = [];
  const deque = [];

  for (let i = 0; i < arr.length; i++) {
    while (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }

    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }

    deque.push(i);

    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
  }

  return result;
}
