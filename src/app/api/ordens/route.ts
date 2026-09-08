import { NextResponse } from "next/server";
import { ACOES_MOCK, ORDENS_MOCK } from "@/lib/mocks";
import type { Ordem } from "@/types/ordem";

// validacao de quantidade minima? isso e front-end fazer nao eu
export async function GET() {
  return NextResponse.json(ORDENS_MOCK);
}

export async function POST(req: Request) {
  const body = await req.json();

  // Bug B10: sem validação de cota mínima (mínimo deveria ser 100 ações)
  // Bug B10: aceita quantidade 0 ou negativa

  if (!body.quantidade || body.quantidade < 100) {
    return NextResponse.json(
      { error: "A quantidade mínima é de 100 ações" },
      { status: 400 }
    );
  }

  const ordem: Ordem = {
    id: crypto.randomUUID(),
    ticker: body.ticker,
    quantidade: body.quantidade,
    preco: body.preco,
    total: body.total,
    tipo: "compra",
    timestamp: new Date().toISOString(),
  };

  // Bug B12: push na array ERRADA (ACOES_MOCK em vez de ORDENS_MOCK)
  // Após 3 ordens, /api/acoes retorna ações misturadas com ordens
  ACOES_MOCK.push(ordem as any); // Bug B12: deveria ser ORDENS_MOCK.push(ordem)

  return NextResponse.json(ordem, { status: 201 });
}
