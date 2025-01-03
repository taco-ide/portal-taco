export default function ProblemIDPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Problema {params.id}</h1>
        </div>
    );
}