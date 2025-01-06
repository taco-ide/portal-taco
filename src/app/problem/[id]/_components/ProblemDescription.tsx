import { Text } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function ProblemDescription() {
  const problemDescription = `
  # Description
  
  Problem Description
  
  # Input
  
  Input Description
  
  # Output
  
  Output Description
  `

  return (
    <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Text className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Problem Description</span>
        </div>
      </div>

      {/* Output Area */}

      <ScrollArea className="h-full">
        <div className="relative">
          <div
            className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-full overflow-auto font-mono text-sm"
          >
            <div className="">
              <pre className="whitespace-pre-wrap text-gray-300">{problemDescription}</pre>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default ProblemDescription;
