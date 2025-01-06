import { Input } from "@/components/ui/input";
import ProblemCard from "../_components/problemCard";


const ProblemsDatabase = [
    {
        id: 1,
        title: "Problema 1",
        description: "Descrição do problema 1",
        difficulty: "Fácil",
        tags: ["Ordenação", "Busca"],
        author : "Autor 1",
    },
    {
        id: 2,
        title: "Problema 2",
        description: "Descrição do problema 2",
        difficulty: "Mediano",
        tags: ["Ordenação", "Busca"],
        author : "Autor 2",
    },
    {
        id: 3,
        title: "Problema 3",
        description: "Descrição do problema 3",
        difficulty: "Difícil",
        tags: ["Ordenação", "Busca"],
        author : "Autor 3",
    },
    {
        id: 4,
        title: "Problema 4",
        description: "Descrição do problema 4",
        difficulty: "Fácil",
        tags: ["Ordenação", "Busca"],
        author : "Autor 4",
    },
    {
        id: 5,
        title: "Problema 5",
        description: "Descrição do problema 5",
        difficulty: "Mediano",
        tags: ["Ordenação", "Busca"],
        author : "Autor 5",
    },
    {
        id: 6,
        title: "Problema 6",
        description: "Descrição do problema 6",
        difficulty: "Difícil",
        tags: ["Ordenação", "Busca"],
        author : "Autor 6",
    },
    {
        id: 7,
        title: "Problema 7",
        description: "Descrição do problema 7",
        difficulty: "Fácil",
        tags: ["Ordenação", "Busca"],
        author : "Autor 7",
    }
]

export default function ExplorePage() {
    return (
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold my-8">Explorar</h1>
            <Input placeholder="Busca" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 my-8">
                {ProblemsDatabase.map((problem) => (
                    <div
                        key={problem.id}
                    >
                        <ProblemCard id={problem.id} title={problem.title} description={problem.description} difficulty={problem.difficulty} tags={problem.tags} author={problem.author}/>
                    </div>
                ))}
            </div>
        </div>
    );
}