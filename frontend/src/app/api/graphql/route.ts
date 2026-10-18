import { yoga } from "@/lib/graphql/schema";


export async function GET(request: Request) {
  return yoga.handle(request);
}

export async function POST(request: Request) {
  return yoga.handle(request);
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
