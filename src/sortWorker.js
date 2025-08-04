self.onmessage = function (e) {
  const { type, data, key, direction, sorterFnString, cacheKey } = e.data;

  if (type === "sort") {
    let comparator;
    try {
      comparator = new Function(
        "a",
        "b",
        "key",
        `return (${sorterFnString})(a,b,key)`
      );
    } catch {
      comparator = () => 0;
    }

    const sorted = [...data].sort((a, b) =>
      direction === "asc" ? comparator(a, b, key) : -comparator(a, b, key)
    );

    self.postMessage({ cacheKey, sorted });
  }
};
