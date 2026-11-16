export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, city, rating, comment, created_at FROM reviews ORDER BY id DESC LIMIT 100"
    ).all();

    return new Response(JSON.stringify({ reviews: results || [] }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, reviews: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 60);
    const city = String(body.city || "").trim().slice(0, 60);
    const comment = String(body.comment || "").trim().slice(0, 600);
    const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));

    if (!name || !comment) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    await env.DB.prepare(
      "INSERT INTO reviews (name, city, rating, comment) VALUES (?, ?, ?, ?)"
    )
      .bind(name, city || "عنابة", rating, comment)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
