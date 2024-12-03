/*
 * @Author: zlinni zlinni@peropero.net
 * @Date: 2024-12-03 11:44:26
 * @LastEditors: zlinni zlinni@peropero.net
 * @LastEditTime: 2024-12-03 18:12:22
 * @FilePath: \amock\src\app\api\mock\route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextRequest, NextResponse } from "next/server";
import { mockStorage } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";
import { generateMockEndpoints, generateSingleEndpoint } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: "缺少必要参数",
        },
        { status: 400 }
      );
    }

    const mockEndpoints = await generateMockEndpoints(description);
    
    // 并发保存所有端点
    await Promise.all(
      mockEndpoints.map(async (endpoint) => {
        const id = uuidv4();
        await mockStorage.set(id, { ...endpoint, id });
      })
    );

    return NextResponse.json({
      code: 0,
      data: mockEndpoints,
      msg: "success",
    });
  } catch (error) {
    console.error("创建Mock失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "创建Mock失败",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const endpoints = await mockStorage.getAll();
    return NextResponse.json({
      code: 0,
      data: endpoints,
      msg: "success",
    });
  } catch (error) {
    console.error("获取Mock列表失败:", error);
    return NextResponse.json(
      {
        code: 1,
        data: null,
        msg: error instanceof Error ? error.message : "获取Mock列表失败",
      },
      { status: 500 }
    );
  }
}
