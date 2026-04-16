import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
      
      <h1 className="text-4xl font-bold mb-4">
        Stratify AI
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        AI-powered decision engine to help startups optimize pricing, features, and growth strategy through data-driven insights and simulations.
      </p>

      <div className="flex gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Go to Dashboard
        </Link>

        <Link
          to="/playground"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Decision Playground
        </Link>
      </div>

    </div>
  );
};

export default Index;