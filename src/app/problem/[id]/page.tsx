import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import ProblemDescription from "./_components/ProblemDescription";

export default function ProblemPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-full p-4 gap-2 bg-slate-900 text-white flex flex-col">
      <div className="h-[110px]">
        <Header />
      </div>
      <div className="h-[100vh - 110px] flex gap-4 overflow-hidden">
        <div className="w-[30%] flex flex-col gap-4">
          <div className="h-2/3">
            <ProblemDescription />
          </div>
          <div className="h-1/3">
            <OutputPanel />
          </div>
        </div>

        <div className="w-[50%] overflow-y-auto">
          <EditorPanel />
        </div>

        <div className="w-[20%] flex items-center justify-center p-6 overflow-y-auto">
          <span className="font-semibold">Chat</span>
        </div>
      </div>
    </div>
  );
}
