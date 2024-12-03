import { NextRequest, NextResponse } from 'next/server';
import { generateMockAPI } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({
        code: 1,
        data: null,
        msg: '请提供实体描述'
      }, { status: 400 });
    }

    const generated = await generateMockAPI(description);

    return NextResponse.json({
      code: 0,
      data: generated,
      msg: 'success'
    });
  } catch (error) {
    console.error('AI生成失败:', error);
    return NextResponse.json({
      code: 1,
      data: null,
      msg: error instanceof Error ? error.message : 'AI生成失败'
    }, { status: 500 });
  }
} 