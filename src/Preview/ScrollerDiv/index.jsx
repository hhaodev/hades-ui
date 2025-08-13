import React, { useEffect, useState } from "react";
import { ScrollerDiv } from "../../components";
const mockData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

// API giả lập
function mockApi(pageIndex, pageSize) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = Math.min(pageSize, 35);
      const start = (pageIndex - 1) * size;
      const end = start + size;
      resolve({
        data: mockData.slice(start, end),
        hasMore: end < mockData.length,
      });
    }, 1000);
  });
}

const ScrollerDivDemo = () => {
  const [items, setItems] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextLoad, setHasNextLoad] = useState(true);
  useEffect(() => {
    let isCancelled = false;

    const fetchPage = async () => {
      setIsLoading(true);
      const res = await mockApi(pageIndex, pageSize);
      if (isCancelled) return;

      setItems((prev) => (pageIndex === 0 ? res.data : [...prev, ...res.data]));
      setHasNextLoad(res.hasMore);
      setIsLoading(false);
    };

    fetchPage();
    return () => {
      isCancelled = true;
    };
  }, [pageIndex, pageSize]);
  return (
    <div style={{ height: "calc(100vh - 20px)", border: "1px solid #ccc" }}>
      <ScrollerDiv
        hasNextLoad={hasNextLoad}
        isLoading={isLoading}
        onLoadNext={() => {
          setPageIndex((prev) => prev + 1);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {items.map((item) => (
            <div
              style={{
                height: "40px",
                width: "100%",
                background: "green",
              }}
              key={item.id}
            >
              {item.name}
            </div>
          ))}
        </div>
      </ScrollerDiv>
    </div>
  );
};

export default ScrollerDivDemo;
