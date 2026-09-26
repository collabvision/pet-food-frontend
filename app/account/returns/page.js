export default function ReturnsPage() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50 min-h-[400px] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-[#FFF8F5] rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🔄</span>
      </div>
      <h2 className="text-2xl font-black text-[#142653] mb-2">Returns & Refunds</h2>
      <p className="text-[#142653]/60 font-medium max-w-md">
        Track the status of your return requests and refunds. (Coming Soon)
      </p>
    </div>
  );
}
