export default function DashboardContainer() {
  return (
    <div className="w-full flex flex-col border-border border-[0.5px] rounded-xl overflow-hidden h-auto">
      <div className="w-full bg-amber-50 flex-1 p-8 text-black rounded-[inherit]">
        Container 1
      </div>

      <div className="w-full flex-1 p-8">
        Container 2
      </div>
    </div>
  )
}