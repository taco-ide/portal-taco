import { Text } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ProblemDescription() {
  const problemDescription = `
  # Description
  
  Problem Description
  
  # Input
  
  Input Description
  
  # Output
  
  Output Description

  # Sample Input
  
  Sample Input
  
  # Sample Output
  
  Sample Output

  # Constraints
  
  Constraints

  # Explanation

  Explanation
  `;

  return (
    <Card className="bg-[#1a1f2e] text-white flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
                <Text className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Problem Description</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="relative">
            <div
              className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
         rounded-xl p-1 h-full overflow-auto font-mono text-sm"
            >
              <div className="">
                <pre className="whitespace-pre-wrap text-gray-300">{problemDescription}</pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ProblemDescription;
