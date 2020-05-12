const getCount = (e) => {
  if (e === null) return 0;
  const ulCount = getCount(e.querySelector("ul"));
  const olCount = getCount(e.querySelector("ol"));
  return 1 + Math.max(ulCount, olCount);
};
const getMaxDepth = () => {
  let max = 0;
  const ulList = document.body.querySelectorAll("ul");
  const olList = document.body.querySelectorAll("ol");
  const list = [...ulList, ...olList];
  list.forEach(e => {
    const count = getCount(e);
    max = Math.max(count, max);
  });
  return max;
};

console.log(getMaxDepth());