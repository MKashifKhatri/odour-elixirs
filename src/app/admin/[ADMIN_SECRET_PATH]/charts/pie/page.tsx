import data from "../data.json";
import { DoughnutChart, PieChart } from "../../_components/Charts";

const chartPalette = ["#111111", "#6e6e73", "#a1a1a6", "#d2d2d7", "#444448"];

const PieCharts = () => {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pie & Doughnut Charts</h1>
        <p className="mt-1 text-sm text-gray-500">Breakdowns for fulfillment, inventory, revenue, and users.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Fulfillment Ratio</h2>
          <p className="text-sm text-gray-500">Processing, shipped, and delivered orders.</p>
        </div>
        <div className="mx-auto max-w-[25rem]">
            <PieChart
              labels={["Processing", "Shipped", "Delivered"]}
              data={[12, 9, 13]}
              backgroundColor={chartPalette.slice(0, 3)}
              offset={[0, 0, 50]}
            />
          </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Categories Ratio</h2>
          <p className="text-sm text-gray-500">Share of products by category.</p>
        </div>
        <div className="mx-auto max-w-[25rem]">
            <DoughnutChart
              labels={data.categories.map((i) => i.heading)}
              data={data.categories.map((i) => i.value)}
              backgroundColor={data.categories.map((_, index) => chartPalette[index % chartPalette.length])}
              legends={false}
              offset={[0, 0, 0, 80]}
            />
          </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Stock Availability</h2>
          <p className="text-sm text-gray-500">In-stock and out-of-stock inventory balance.</p>
        </div>
        <div className="mx-auto max-w-[25rem]">
            <DoughnutChart
              labels={["In Stock", "Out Of Stock"]}
              data={[40, 20]}
              backgroundColor={["#111111", "#d2d2d7"]}
              legends={false}
              offset={[0, 80]}
              cutout={"70%"}
            />
          </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Users Age Group</h2>
          <p className="text-sm text-gray-500">Demographic split of the customer base.</p>
        </div>
        <div className="mx-auto max-w-[25rem]">
            <PieChart
              labels={[
                "Teenager(Below 20)",
                "Adult (20-40)",
                "Older (above 40)",
              ]}
              data={[30, 250, 70]}
              backgroundColor={chartPalette.slice(0, 3)}
              offset={[0, 0, 50]}
            />
          </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin vs Customers</h2>
          <p className="text-sm text-gray-500">Compare admin and customer account volume.</p>
        </div>
        <div className="mx-auto max-w-[25rem]">
            <DoughnutChart
              labels={["Admin", "Customers"]}
              data={[40, 250]}
              backgroundColor={["#111111", "#a1a1a6"]}
              offset={[0, 50]}
            />
          </div>
      </section>
    </div>
  );
};

export default PieCharts;
