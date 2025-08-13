import React, { useMemo } from "react";
import { Button, DateRangePicker, Stack, Table } from "../../components";
import { formatDate } from "../../utils";

const TableDemo = () => {
  const columns = useMemo(() => {
    return [
      {
        title: "STT",
        key: "stt",
        render: (_, __, index) => <span>{index + 1}</span>,
        width: 60,
        align: "center",
      },
      {
        title: <span>Name</span>,
        dataIndex: "name",
        key: "name",
        render: (v) => <span>{v}</span>,
        sortable: true,
        sorter: (a, b) =>
          String(a.name).localeCompare(String(b.name), undefined, {
            sensitivity: "base",
            numeric: true,
          }),
        fixed: "left",
        searchable: true,
        align: "center",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sortable: true,
        searchable: true,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "Description",
        maxRowText: 4,
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => <span>{formatDate(v, "DD-MM-YYYY")}</span>,
        sortable: true,
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "250px",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>Custom filter</div>
              <DateRangePicker
                value={selectedKeys?.selected[0]}
                onChange={(value) =>
                  setSelectedKeys(
                    value ? [{ start: value.start, end: value.end }] : [] // required array => return array[0] at value in OnFilter
                  )
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  theme="text"
                  onClick={() => clearFilters()}
                  size="small"
                >
                  Reset
                </Button>
                <Button onClick={() => confirm()} size="small">
                  Apply
                </Button>
              </div>
            </div>
          );
        },
        onFilter: (value, record) => {
          // value expected: { start: string|Date, end: string|Date }
          if (!value || !value.start || !value.end) return true;

          const recordDate = new Date(record.createdAt);
          if (isNaN(recordDate.getTime())) return false;

          const startDay = new Date(value.start);
          startDay.setHours(0, 0, 0, 0);

          const endDay = new Date(value.end);
          endDay.setHours(23, 59, 59, 999);

          return recordDate >= startDay && recordDate <= endDay;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        // ví dụ custom active > pending > inactive > banned
        sortable: true,
        sorter: (a, b) => {
          const order = { active: 0, pending: 1, inactive: 2, banned: 3 };
          return (order[a.status] ?? 99) - (order[b.status] ?? 99);
        },
        filters: [
          { text: "Active", value: "active" },
          { text: "Pending", value: "pending" },
          { text: "Inactive", value: "inactive" },
          { text: "Banned", value: "banned" },
          { text: "Not Active", value: "notActive" },
        ],
        onFilter: (value, record) => {
          // custom filter
          if (value === "notActive") {
            return ["inactive", "banned"].includes(record.status);
          }
          return record.status === value;
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (v) => <span>{typeof v === "number" ? v.toFixed(2) : v}</span>,
        sortable: true,
        sorter: (a, b) => {
          const va = a.amount ?? 0;
          const vb = b.amount ?? 0;
          return va - vb;
        },
      },
      ...Array.from({ length: 5 }, (_, i) => {
        const dataIndex = `col${i + 1}`;
        return {
          title: `Tag ${i + 1}`,
          dataIndex,
          key: dataIndex,
          render: (v) => <span>{v}</span>,
          sortable: true,
        };
      }),
    ];
  }, []);

  const dataTable = useMemo(() => {
    const rand = ((s) => {
      let a = s;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })(42);

    const firstNames = [
      "Linh",
      "An",
      "Minh",
      "Huy",
      "Thu",
      "Trang",
      "Hoa",
      "Quang",
      "Hà",
      "Vy",
    ];
    const lastNames = [
      "Nguyễn",
      "Trần",
      "Lê",
      "Phạm",
      "Hoàng",
      "Phan",
      "Vũ",
      "Đặng",
      "Bùi",
      "Đỗ",
    ];
    const tags = ["alpha", "beta", "gamma", "delta", "epsilon"];
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    const normal = (mean = 120, sd = 30) => {
      const u = 1 - rand();
      const v = 1 - rand();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return Math.round(Math.max(0, mean + z * sd) * 100) / 100;
    };

    return Array.from({ length: 500000 }, (_, i) => {
      const id = (i + 1).toString();
      const key = id;
      const first = firstNames[Math.floor(rand() * firstNames.length)];
      const last = lastNames[Math.floor(rand() * lastNames.length)];
      const name = `${first} ${last}`;
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(
        rand() * 100
      )}@example.com`;
      const createdAt = new Date(
        now - Math.floor(rand() * oneYear)
      ).toISOString();
      const p = rand();
      const status =
        p < 0.7
          ? "active"
          : p < 0.85
          ? "pending"
          : p < 0.95
          ? "inactive"
          : "banned";
      const amount = normal();

      const longText = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Phasellus nec iaculis mauris.",
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.",
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.",
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.",
      ];
      const description =
        i % 5 === 0
          ? longText.join(" ")
          : i % 3 === 0
          ? longText[0]
          : longText[0].slice(0, 20);

      return {
        id,
        key,
        name,
        email,
        createdAt,
        status,
        amount,
        description,
        col1: tags[Math.floor(rand() * tags.length)],
        col2: tags[Math.floor(rand() * tags.length)],
        col3: tags[Math.floor(rand() * tags.length)],
        col4: tags[Math.floor(rand() * tags.length)],
        col5: tags[Math.floor(rand() * tags.length)],
      };
    });
  }, []);
  return (
    <Table
      checkable //radio || true || checkbox // default === true === checkbox
      columns={columns}
      data={dataTable}
      onCheck={(items) => {
        console.log(items);
      }}
      rowKey="key" //id để biết từng row là khác nhau
      style={{
        maxHeight: "calc(100vh - 20px)",
      }}
    />
  );
};

export default TableDemo;
