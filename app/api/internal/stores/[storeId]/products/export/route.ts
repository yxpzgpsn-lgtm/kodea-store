import { NextResponse } from "next/server";
import { StoreAccessError, requireStoreAccess } from "@/lib/auth/require-store-access";
import { exportProductsCsv } from "@/services/product-csv-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params;

  try {
    await requireStoreAccess(storeId);
  } catch (error) {
    if (error instanceof StoreAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const csv = await exportProductsCsv(storeId);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-${storeId}.csv"`,
    },
  });
}
