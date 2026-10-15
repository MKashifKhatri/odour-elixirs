import { BarChart } from "../../_components/Charts";


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

const Barcharts = () => {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bar Charts</h1>
        <p className="mt-1 text-sm text-gray-500">Compare revenue, users, and orders across the year.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Products & Top Customers</h2>
          <p className="text-sm text-gray-500">A side-by-side comparison of two core metrics.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <BarChart
            data_2={[300, 144, 433, 655, 237, 755, 190]}
            data_1={[200, 444, 343, 556, 778, 455, 990]}
            title_1="Products"
            title_2="Users"
            bgColor_1="#211bd1"
            bgColor_2="rgba(33, 27, 209, 0.16)"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Orders throughout the year</h2>
          <p className="text-sm text-gray-500">Monthly order volume in horizontal layout.</p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <BarChart
            horizontal={true}
            data_1={[
              200, 444, 343, 556, 778, 455, 990, 444, 122, 334, 890, 909,
            ]}
            data_2={[]}
            title_1="Orders"
            title_2=""
            bgColor_1="#57947a"
            bgColor_2=""
            labels={months}
          />
        </div>
      </section>
    </div>
  );
};

export default Barcharts;
