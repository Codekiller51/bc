import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`creative_id.eq.${userId},client_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { creative_id, project_title, description, start_date, end_date, amount } = data;

    if (!creative_id || !project_title || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        creative_id,
        client_id: data.client_id,
        project_title,
        description,
        start_date,
        end_date,
        amount,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
