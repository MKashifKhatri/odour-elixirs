import { LineChart } from "../../_components/Charts";


const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const Linecharts = () => {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Line Charts</h1>
        <p className="mt-1 text-sm text-gray-500">Trend lines for users, products, revenue, and discounts.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Users</h2>
          <p className="text-sm text-gray-500">User activity trend over the year.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <LineChart
            data={[
              200, 444, 444, 556, 778, 455, 990, 1444, 256, 447, 1000, 1200,
            ]}
            label="Users"
            borderColor="#111111"
            labels={months}
            backgroundColor="rgba(0, 0, 0, 0.10)"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Total Products (SKU)</h2>
          <p className="text-sm text-gray-500">Catalog growth across months.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <LineChart
            data={[40, 60, 244, 100, 143, 120, 41, 47, 50, 56, 32]}
            backgroundColor={"rgba(0,0,0,0.10)"}
            borderColor={"#111111"}
            labels={months}
            label="Products"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Total Revenue</h2>
          <p className="text-sm text-gray-500">Revenue trend for the current financial year.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <LineChart
            data={[
              24000, 14400, 24100, 34300, 90000, 20000, 25600, 44700, 99000,
              144400, 100000, 120000,
            ]}
            backgroundColor={"rgba(0,0,0,0.10)"}
            borderColor={"#6e6e73"}
            label="Revenue"
            labels={months}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Discount Allotted</h2>
          <p className="text-sm text-gray-500">Discount allocation and promotional activity.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <LineChart
            data={[
              9000, 12000, 12000, 9000, 1000, 5000, 4000, 1200, 1100, 1500,
              2000, 5000,
            ]}
            backgroundColor={"rgba(0,0,0,0.10)"}
            borderColor={"#a1a1a6"}
            label="Discount"
            labels={months}
          />
        </div>
      </section>
    </div>
  );
};

export default Linecharts;
