import { NextResponse } from "next/server";
import { ACOES_MOCK } from "@/lib/mocks";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  try {
    const res = await fetch(`https://brapi.dev/api/quote/${ticker}?fundamental=false`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error("brapi offline");
    const data = await res.json();

    // Bug B9: quando ticker não existe na brapi, results é array vazio
    // mas retornamos {} com status 200 em vez de 404
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "Ação não encontrada" },
        { status: 404 }); // Bug B9: deveria ser status 404
    }
    return NextResponse.json(data.results[0]); // retorna raw brapi
  } catch {
    const acao = ACOES_MOCK.find(a => a.ticker === ticker.toUpperCase());
    if (!acao) {
      return NextResponse.json({ error: "Ação não encontrada" },
        { status: 404 }); // Bug B9: deveria ser NextResponse.json({ error: "..." }, { status: 404 })
    }
    return NextResponse.json(acao);
  }
}
