import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const res = await fetch('https://marcconrad.com/uob/heart/', {
			method: 'GET',
			headers: { Accept: 'application/json, text/plain, */*' },
			cache: 'no-store',
		});

		const text = await res.text();
		let data: unknown;
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}

		return NextResponse.json({ ok: true, data }, { status: res.status });
	} catch (error) {
		return NextResponse.json(
			{ ok: false, error: (error as Error).message ?? String(error) },
			{ status: 500 },
		);
	}
}

