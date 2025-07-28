import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creativeId = searchParams.get('creative_id');

    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('creative_id', creativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { creative_id, rating, content } = data;

    if (!creative_id || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        creative_id,
        client_id: data.client_id,
        rating,
        content
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
