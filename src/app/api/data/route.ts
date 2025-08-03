import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', to_jsonb(row) - 'geom' - 'user_id'
          )
        )
      ) AS geojson
      FROM (SELECT * FROM afrique WHERE user_id = $1) AS row;`,
      [userId]
    );
    client.release();

    const geojsonData = result.rows[0].geojson;

    if (!geojsonData || !geojsonData.features) {
      return NextResponse.json({ type: "FeatureCollection", features: [] });
    }

    return NextResponse.json(geojsonData);
  } catch (error) {
    console.error("Erreur de base de données:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
