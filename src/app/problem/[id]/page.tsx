import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import ProblemDescription from "./_components/ProblemDescription";

export default function ProblemPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-screen p-4 gap-4 bg-slate-900 text-white flex flex-col overflow-hidden">

      <Header />

      <div className="flex-1 flex flex-row gap-4">


        <div className="flex-1 h-[80vh]">
          <Tabs defaultValue="problem" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-4 bg-[--color-tacoyellowdark] text-white">
              <TabsTrigger value="problem">problem</TabsTrigger>
              <TabsTrigger value="output">output</TabsTrigger>
              <TabsTrigger value="input">input</TabsTrigger>
              <TabsTrigger value="chat">chat</TabsTrigger>
            </TabsList>
            <TabsContent value="problem">
              <ProblemDescription />
            </TabsContent>
            <TabsContent value="output">
              <OutputPanel />
            </TabsContent>
            <TabsContent value="input">
              <div className="flex items-center justify-center p-6 overflow-y-auto">
                <span className="font-semibold">Input</span>
              </div>
            </TabsContent>
            <TabsContent value="chat">
              <div className="flex items-center justify-center p-6 overflow-y-auto">
                <span className="font-semibold">Chat</span>
              </div>
            </TabsContent>
          </Tabs>
        </div>


        <div className="flex-1 h-[80vh]">
          <EditorPanel />
        </div>
      </div>


    </div>
  );
}
