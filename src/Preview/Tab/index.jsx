import React, { useEffect, useMemo, useState } from "react";
import { ChipTabs, Stack, Tabs } from "../../components";
const Render = ({ title }) => {
  const [loading, setLoading] = useState(true);
  const randomDivs = useMemo(() => {
    const count = Math.floor(Math.random() * 5) + 1;
    return Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
  }, []);

  useEffect(() => {
    console.log(`Content render ${title}`);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div>{`Loading ${title}...`}</div>
      </div>
    );
  }

  return (
    <div>
      <div>{`Content render ${title}`}</div>
      {randomDivs.map((item, index) => (
        <div key={index} style={{ paddingLeft: 12 }}>
          - {item}
        </div>
      ))}
    </div>
  );
};
const TabDemo = () => {
  const TabList = () => {
    const tabs = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
      <>
        {tabs.map((n) => (
          <Tabs.Item key={`tab-${n}`} tabKey={`tab${n}`} title={`Tab ${n}`}>
            <Render title={n} key={`tab-${n}`} />
          </Tabs.Item>
        ))}
      </>
    );
  };
  return (
    <Stack>
      <Stack>Chip tab</Stack>
      <ChipTabs
        tabs={[
          { key: 1, title: "Tab 1" /*props....*/ },
          { key: 2, title: "Tab 2" },
          { key: 3, title: "Tab 3" },
          { key: 4, title: "Tab 4" },
        ]}
        onChange={(tab) => {
          console.log(tab);
        }}
      />
      <Stack>Tab (tabPosition: top)</Stack>
      <Tabs defaultActive="tab1" tabPosition="top">
        <TabList />
      </Tabs>
      <Stack>Tab (tabPosition: bottom)</Stack>
      <Tabs defaultActive="tab2" tabPosition="bottom">
        <TabList />
      </Tabs>
      <Stack>Tab (tabPosition: left)</Stack>
      <Tabs defaultActive="tab3" tabPosition="left">
        <TabList />
      </Tabs>
      <Stack>Tab (tabPosition: right)</Stack>
      <Tabs defaultActive="tab4" tabPosition="right">
        <TabList />
      </Tabs>
    </Stack>
  );
};

export default TabDemo;
