import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export interface ProblemCardProps {
    id: number,
    title: string,
    description: string,
    difficulty: string,
    tags: string[],
    author: string,
}

export default function ProblemCard( { id, title, description, difficulty, tags, author }: ProblemCardProps) {
  return (
    <Card className="w-full bg-[#1a1f2e] text-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Dificuldade: {difficulty}</p>
        <p>Tags: {tags.join(", ")}</p>
        <p>Autor: {author}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/problem/${id}`}>
          <Button>Explore</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
