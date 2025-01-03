import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ProblemDescription from "./_components/ProblemDescription";

export default async function ProblemPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen w-full mx-auto p-4 flex flex-col bg-slate-900 text-white">
      <Header />

      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg w-full h-full flex-1"
      >
        <ResizablePanel defaultSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65}>
              <ProblemDescription />
            </ResizablePanel>
            <ResizableHandle withHandle={true} />
            <ResizablePanel defaultSize={35}>
              <OutputPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <EditorPanel />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Chat</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
